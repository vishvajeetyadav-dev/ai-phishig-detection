'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AnalysisRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ScanLine,
  MessageSquareWarning,
  Info,
  Lock,
  Eye,
  Mail,
  Phone,
  Link2,
  Clock,
} from 'lucide-react';

interface InsightData {
  total: number;
  urlCount: number;
  messageCount: number;
  criticalCount: number;
  highCount: number;
  topIndicators: { indicator: string; count: number }[];
  recentCritical: AnalysisRecord[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: records, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error || !records) {
        setLoading(false);
        return;
      }

      const all = records as AnalysisRecord[];
      const indicatorCounts = new Map<string, number>();
      all.forEach((r) => {
        (r.indicators as string[]).forEach((ind) => {
          indicatorCounts.set(ind, (indicatorCounts.get(ind) ?? 0) + 1);
        });
      });

      const topIndicators = Array.from(indicatorCounts.entries())
        .map(([indicator, count]) => ({ indicator, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setData({
        total: all.length,
        urlCount: all.filter((r) => r.type === 'url').length,
        messageCount: all.filter((r) => r.type === 'message').length,
        criticalCount: all.filter((r) => r.risk_level === 'CRITICAL').length,
        highCount: all.filter((r) => r.risk_level === 'HIGH').length,
        topIndicators,
        recentCritical: all.filter((r) => r.risk_level === 'CRITICAL' || r.risk_level === 'HIGH').slice(0, 5),
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const hasData = data !== null && data.total > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Security Insights</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Understand your security posture based on your real analysis data.
        </p>
      </div>

      {!hasData ? (
        <Card className="border-border/60 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium">No insights yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Run some URL or message analyses to see personalized security insights based on your scan history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ScanLine className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data!.urlCount}</p>
                    <p className="text-xs text-muted-foreground">URL Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquareWarning className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data!.messageCount}</p>
                    <p className="text-xs text-muted-foreground">Message Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data!.highCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data!.criticalCount}</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top indicators */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Most Common Indicators
              </CardTitle>
              <CardDescription>The phishing indicators most frequently detected across your analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {data!.topIndicators.length > 0 ? (
                <div className="space-y-3">
                  {data!.topIndicators.map((item, i) => {
                    const maxCount = data!.topIndicators[0].count;
                    const pct = (item.count / maxCount) * 100;
                    return (
                      <div key={i}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.indicator}</span>
                          <span className="font-semibold">{item.count}x</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No indicators detected in your analyses.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent high-risk items */}
          {data!.recentCritical.length > 0 && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                  Recent High & Critical Risk Items
                </CardTitle>
                <CardDescription>These items warrant the most attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data!.recentCritical.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.risk_level === 'CRITICAL' ? 'bg-danger/10 text-danger' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                        {r.type === 'url' ? <Link2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.input}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${r.risk_level === 'CRITICAL' ? 'text-danger' : 'text-orange-600 dark:text-orange-400'}`}>
                        {r.score}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Educational tips */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  How to Spot Phishing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    { icon: Clock, text: 'Urgency: Phishing messages often pressure you to act immediately, claiming your account will be closed or a deadline is approaching.' },
                    { icon: Lock, text: 'Credential requests: Legitimate organizations never ask for your password, PIN, or full card number via email or SMS.' },
                    { icon: Link2, text: 'Suspicious URLs: Check for misspelled domains, IP addresses, or redirects. Hover over links before clicking.' },
                    { icon: Mail, text: 'Generic greetings: Phishing often uses "Dear Customer" instead of your name. Check the sender\'s email address carefully.' },
                    { icon: Eye, text: 'Too good to be true: Prize notifications, lottery winnings, and unexpected refunds are common phishing lures.' },
                    { icon: Phone, text: 'Callback numbers: Verify phone numbers through official websites. Phishing messages may include fake support numbers.' },
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    'Enable two-factor authentication (2FA) on all important accounts.',
                    'Never click links in unsolicited emails or messages — type the URL directly.',
                    'Keep your browser and antivirus software up to date.',
                    'Use a password manager to generate and store unique passwords.',
                    'Verify financial requests by calling the organization directly using a known, trusted number.',
                    'Report phishing attempts to your IT team or the appropriate authority.',
                    'When in doubt, do not click, reply, or provide any information.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> Automated analysis can identify suspicious indicators, but no
              automated system can guarantee that a website or message is completely safe. These insights
              are based on your analysis history and are for informational purposes only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
