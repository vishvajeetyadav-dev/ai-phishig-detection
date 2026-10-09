import type { AnalysisResult, RiskLevel } from '@/lib/types';

function classifyScore(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

interface Indicator {
  label: string;
  weight: number;
}

interface AnalysisOutput {
  indicators: Indicator[];
  recommendation: string;
}

function buildResult(indicators: Indicator[], recommendation: string): AnalysisResult {
  const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);
  const rawScore = Math.min(totalWeight, 100);
  const score = Math.round(rawScore);
  const riskLevel = classifyScore(score);

  const indicatorLabels = indicators.map((i) => i.label);

  const explanation =
    indicatorLabels.length === 0
      ? 'No suspicious indicators were detected. The URL structure appears normal, but this does not guarantee the site is safe.'
      : `This URL received a risk score of ${score}/100 based on ${indicatorLabels.length} indicator${indicatorLabels.length > 1 ? 's' : ''}: ${indicatorLabels.join(', ')}.`;

  return {
    score,
    riskLevel,
    indicators: indicatorLabels,
    explanation,
    recommendation,
  };
}

/**
 * Normalize a raw URL string: trim whitespace and prepend https:// if the
 * protocol is missing so that URL parsing succeeds for user-friendly input.
 */
function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  // Already has a protocol
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If it starts with // it's a protocol-relative URL
  if (trimmed.startsWith('//')) {
    return 'https:' + trimmed;
  }

  // Prepend https:// for protocol-less input
  return 'https://' + trimmed;
}

export function analyzeUrl(rawUrl: string): AnalysisResult {
  const indicators: Indicator[] = [];
  let recommendation = 'No immediate action needed. Continue with normal browsing caution.';

  const normalized = normalizeUrl(rawUrl);

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      score: 100,
      riskLevel: 'CRITICAL',
      indicators: ['Invalid URL structure — the URL could not be parsed'],
      explanation:
        'The provided URL could not be parsed as a valid URL. This is a strong indicator of a malformed or suspicious link.',
      recommendation: 'Do not visit this URL. It is malformed and may be an attempt to disguise a malicious link.',
    };
  }

  // Reject empty hostname (e.g. "https://" alone)
  if (!parsed.hostname) {
    return {
      score: 100,
      riskLevel: 'CRITICAL',
      indicators: ['Invalid URL structure — no hostname present'],
      explanation:
        'The provided URL has no hostname. This is a malformed or suspicious link.',
      recommendation: 'Do not visit this URL. It is malformed and may be an attempt to disguise a malicious link.',
    };
  }

  const protocol = parsed.protocol.replace(':', '');
  const hostname = parsed.hostname;
  const fullUrl = parsed.href;
  const path = parsed.pathname + parsed.search;

  if (protocol === 'http') {
    indicators.push({ label: 'Insecure HTTP connection (not HTTPS)', weight: 15 });
  }

  if (protocol !== 'http' && protocol !== 'https') {
    indicators.push({ label: `Unusual protocol: ${protocol}`, weight: 20 });
  }

  // IP address as hostname
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    indicators.push({ label: 'Uses an IP address instead of a domain name', weight: 25 });
  }

  // Excessive subdomains
  const subdomains = hostname.split('.').filter((p) => p.length > 0);
  if (subdomains.length > 4) {
    indicators.push({ label: 'Excessive number of subdomains', weight: 15 });
  }

  // URL length checks
  if (fullUrl.length > 100) {
    indicators.push({ label: 'Unusually long URL', weight: 10 });
  }

  if (fullUrl.length > 200) {
    indicators.push({ label: 'Excessively long URL (over 200 characters)', weight: 10 });
  }

  // URL-encoded characters
  const encodedChars = /%[0-9a-fA-F]{2}/;
  if (encodedChars.test(fullUrl)) {
    indicators.push({ label: 'Contains URL-encoded characters', weight: 12 });
  }

  // Userinfo @ phishing detection — URL.hostname strips userinfo, so check parsed.username
  // and also the raw URL for the @ pattern in the authority component
  if (parsed.username || parsed.password) {
    indicators.push({ label: 'Contains userinfo (@) in URL — common phishing obfuscation', weight: 20 });
  }

  // Redirect parameters
  if (
    parsed.search.includes('redirect=') ||
    parsed.search.includes('url=') ||
    parsed.search.includes('next=') ||
    parsed.search.includes('goto=') ||
    parsed.search.includes('return=') ||
    parsed.search.includes('continue=')
  ) {
    indicators.push({ label: 'Contains URL redirection parameter', weight: 18 });
  }

  // Punycode / homograph domains
  const punycode = /^xn--/i;
  if (punycode.test(hostname)) {
    indicators.push({ label: 'Punycode / internationalized domain (homograph risk)', weight: 22 });
  }

  // Suspicious keywords in the full URL
  const suspiciousKeywords = [
    'login', 'signin', 'account', 'verify', 'secure', 'update', 'confirm',
    'password', 'bank', 'paypal', 'wallet', 'security', 'support',
  ];
  const lowerUrl = fullUrl.toLowerCase();
  const matchedKeywords = suspiciousKeywords.filter((kw) => lowerUrl.includes(kw));
  if (matchedKeywords.length >= 2) {
    indicators.push({ label: `Suspicious keywords detected: ${matchedKeywords.join(', ')}`, weight: 15 });
  } else if (matchedKeywords.length === 1) {
    indicators.push({ label: `Suspicious keyword detected: ${matchedKeywords[0]}`, weight: 7 });
  }

  // Frequently-abused TLDs
  const lookalikeTlds = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.xyz', '.click',
    '.country', '.stream', '.loan', '.work', '.men', '.racing',
    '.review', '.party', '.trade', '.date',
  ];
  const matchedTlds = lookalikeTlds.filter((tld) => hostname.endsWith(tld));
  if (matchedTlds.length > 0) {
    indicators.push({ label: `Uses a frequently-abused TLD: ${matchedTlds.join(', ')}`, weight: 15 });
  }

  // Numbers in the first domain label (not an IP)
  if (/\d+/.test(hostname.split('.')[0]) && !ipPattern.test(hostname)) {
    indicators.push({ label: 'Domain name contains numbers', weight: 8 });
  }

  // Multiple hyphens in hostname
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    indicators.push({ label: 'Domain contains multiple hyphens', weight: 12 });
  }

  // Brand/keyword impersonation pattern in domain
  if (/[-_](login|secure|account|verify|update|confirm)[-_]/i.test(hostname)) {
    indicators.push({ label: 'Brand/keyword impersonation pattern in domain', weight: 18 });
  }

  // Long query string
  if (parsed.search.length > 50) {
    indicators.push({ label: 'Long query string', weight: 8 });
  }

  // Dangerous file extensions in the path
  if (/\.(exe|zip|scr|bat|cmd|js|jar|vbs|iso|msi|dll)$/i.test(path)) {
    indicators.push({ label: 'URL references a potentially dangerous file type', weight: 15 });
  }

  // Build recommendation
  if (protocol === 'http') {
    recommendation = 'This URL uses an unencrypted HTTP connection. Avoid entering any personal or financial information on this site.';
  }

  if (indicators.length >= 4) {
    recommendation = 'Multiple suspicious indicators detected. Do not enter credentials or personal information. Verify the destination through a trusted channel before proceeding.';
  }

  if (indicators.length >= 6) {
    recommendation = 'Strong phishing indicators detected. Do not visit this URL, enter credentials, or download any files. Report this link if you received it from an unknown source.';
  }

  return buildResult(indicators, recommendation);
}

// Export normalizeUrl so validation and frontend can share the same logic
export { normalizeUrl };
