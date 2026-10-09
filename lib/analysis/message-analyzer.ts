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

interface MatchConfig {
  label: string;
  weight: number;
  patterns: RegExp[];
}

const configs: MatchConfig[] = [
  {
    label: 'Creates false sense of urgency',
    weight: 12,
    patterns: [/urgent/i, /immediately/i, /asap/i, /right away/i, /act now/i, /expires? (in|today|soon)/i, /within \d+ (hour|minute|day)/i, /limited time/i, /before it'?s too late/i, /suspended today/i],
  },
  {
    label: 'Threatening or intimidating language',
    weight: 15,
    patterns: [/account (will be|shall be) (closed|suspended|terminated|locked|deactivated)/i, /legal action/i, /penalt/i, /consequence/i, /prosecut/i, /your account.*blocked/i, /final (notice|warning)/i],
  },
  {
    label: 'Requests credentials or passwords',
    weight: 25,
    patterns: [/enter your password/i, /confirm your password/i, /provide.*password/i, /send.*password/i, /username.*password/i, /login credentials/i, /enter.*pin/i, /verify your password/i],
  },
  {
    label: 'Requests OTP or verification code',
    weight: 20,
    patterns: [/otp/i, /one.?time.?password/i, /verification code/i, /security code/i, /enter.*code (sent|received)/i, /2fa/i, /two.?factor/i],
  },
  {
    label: 'Requests payment or financial information',
    weight: 22,
    patterns: [/send.*payment/i, /wire transfer/i, /bitcoin/i, /crypto/i, /gift card/i, /pay.*fee/i, /processing fee/i, /credit card number/i, /card details/i, /invoice.*overdue/i],
  },
  {
    label: 'Requests bank or financial account information',
    weight: 22,
    patterns: [/bank account/i, /account number/i, /routing number/i, /sort code/i, /iban/i, /swift code/i, /bank details/i, /verify.*bank/i],
  },
  {
    label: 'Impersonates a well-known organization',
    weight: 15,
    patterns: [/paypal/i, /amazon/i, /apple.*id/i, /microsoft/i, /google.*account/i, /netflix/i, /facebook/i, /instagram/i, /linkedin/i, /your bank/i, /irs/i, /hmrc/i, /social security/i, /fedex/i, /ups/i, /dhl/i, /usps/i],
  },
  {
    label: 'Promises rewards, prizes, or lottery winnings',
    weight: 18,
    patterns: [/you'?ve? won/i, /congratulations.*winner/i, /lottery/i, /prize/i, /claim your reward/i, /free gift/i, /selected to receive/i, /inheritance/i, /unclaimed funds/i],
  },
  {
    label: 'Contains suspicious links',
    weight: 15,
    patterns: [/https?:\/\/(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|shorturl|is\.gd|buff\.ly)/i, /click (here|below|the link)/i, /tap (here|below)/i, /visit.*link/i],
  },
  {
    label: 'Requests personal or sensitive information',
    weight: 18,
    patterns: [/social security number/i, /date of birth/i, /mother'?s maiden name/i, /home address/i, /passport/i, /national id/i, /sin number/i],
  },
  {
    label: 'Uses generic or impersonal greeting',
    weight: 6,
    patterns: [/dear (customer|user|sir|madam|valued client|account holder)/i, /^hello\b/im],
  },
  {
    label: 'Contains poor grammar or spelling inconsistencies',
    weight: 8,
    patterns: [/kindly/i, /revert back/i, /do the needful/i, /we apologies? for/i, /comfirm/i, /verifcation/i, /acccount/i, /imediately/i],
  },
  {
    label: 'Mentions suspicious attachments',
    weight: 14,
    patterns: [/open the attached/i, /download.*attachment/i, /see attached file/i, /\.(exe|zip|scr|js|jar|bat|cmd|vbs|iso)\b/i, /attached document/i],
  },
  {
    label: 'Creates false trust with official-sounding language',
    weight: 8,
    patterns: [/security (alert|warning|notice|team)/i, /verification (process|department|team)/i, /fraud (prevention|department)/i, /account (verification|review)/i, /suspicious activity/i, /unauthorized access/i],
  },
];

const criticalPatterns = [
  { label: 'Explicit request for full credentials with link', weight: 15, pattern: /(password|credential|login).*(click|link|http)/is },
];

export function analyzeMessage(text: string): AnalysisResult {
  const indicators: Indicator[] = [];
  let recommendation = 'This message appears low risk. Continue with normal caution, but always verify the sender if anything feels off.';

  for (const config of configs) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        indicators.push({ label: config.label, weight: config.weight });
        break;
      }
    }
  }

  for (const cp of criticalPatterns) {
    if (cp.pattern.test(text)) {
      indicators.push({ label: cp.label, weight: cp.weight });
    }
  }

  // Analyze URLs embedded in the message
  const urlMatches = text.match(/https?:\/\/[^\s<]+/gi) || [];
  for (const url of urlMatches) {
    try {
      const parsed = new URL(url);
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipPattern.test(parsed.hostname)) {
        indicators.push({ label: 'Contains a link that uses an IP address', weight: 15 });
      }
      if (parsed.protocol === 'http:') {
        indicators.push({ label: 'Contains an insecure HTTP link', weight: 10 });
      }
      if (/xn--/i.test(parsed.hostname)) {
        indicators.push({ label: 'Contains a Punycode link (homograph attack risk)', weight: 12 });
      }
      if (parsed.username || parsed.password) {
        indicators.push({ label: 'Contains a link with userinfo (@) obfuscation', weight: 12 });
      }
      // Suspicious keywords in embedded URL
      const lowerUrl = url.toLowerCase();
      const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'confirm', 'password', 'bank', 'paypal'];
      const matched = suspiciousKeywords.filter((kw) => lowerUrl.includes(kw));
      if (matched.length >= 2) {
        indicators.push({ label: `Embedded URL contains suspicious keywords: ${matched.join(', ')}`, weight: 10 });
      }
    } catch {
      indicators.push({ label: 'Contains a malformed URL', weight: 10 });
    }
  }

  const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);
  const rawScore = Math.min(totalWeight, 100);
  const score = Math.round(rawScore);
  const riskLevel = classifyScore(score);

  const indicatorLabels = indicators.map((i) => i.label);

  const explanation =
    indicatorLabels.length === 0
      ? 'No suspicious indicators were detected in this message. However, this does not guarantee the message is safe — always apply judgment.'
      : `This message received a risk score of ${score}/100 based on ${indicatorLabels.length} indicator${indicatorLabels.length > 1 ? 's' : ''}: ${indicatorLabels.join(', ')}.`;

  if (score >= 75) {
    recommendation = 'Do not click any links, provide credentials, send money, or share personal information. Delete this message and report it as phishing.';
  } else if (score >= 50) {
    recommendation = 'Multiple suspicious indicators detected. Do not click links or share sensitive information. Verify the sender through an independent, trusted channel.';
  } else if (score >= 25) {
    recommendation = 'Some suspicious indicators were found. Exercise caution — do not share credentials or financial information. Verify the sender if you are unsure.';
  }

  return {
    score,
    riskLevel,
    indicators: indicatorLabels,
    explanation,
    recommendation,
  };
}
