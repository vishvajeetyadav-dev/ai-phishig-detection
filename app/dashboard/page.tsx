'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { AnalysisRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskBadge, riskColor } from '@/components/risk-badge';
import {
  ScanLine,
  MessageSquareWarning,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity,
  Loader2,
} from 'lucide-react';

interface Stats {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  urlCount: number;
  messageCount: number;
  avgScore: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = (user?.user_metadata?.name as string) ?? 'there';

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const records = data as AnalysisRecord[];
      const s: Stats = {
        total: records.length,
        low: records.filter((r) => r.risk_level === 'LOW').length,
        medium: records.filter((r) => r.risk_level === 'MEDIUM').length,
        high: records.filter((r) => r.risk_level === 'HIGH').length,
        critical: records.filter((r) => r.risk_level === 'CRITICAL').length,
        urlCount: records.filter((r) => r.type === 'url').length,
        messageCount: records.filter((r) => r.type === 'message').length,
        avgScore:
          records.length > 0
            ? Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length)
            : 0,
      };

      setStats(s);
      setRecent(records.slice(0, 5));
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = stats !== null && stats.total > 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {displayName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your security analysis overview.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/dashboard/url-scanner">
          <Card className="group cursor-pointer border-border/60 transition-all hover:border-primary/40 hover:shadow-md">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Scan a URL</p>
                  <p className="text-sm text-muted-foreground">Analyze a suspicious link</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/message-scanner">
          <Card className="group cursor-pointer border-border/60 transition-all hover:border-primary/40 hover:shadow-md">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquareWarning className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Scan a Message</p>
                  <p className="text-sm text-muted-foreground">Analyze email or SMS content</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Analyses" value={stats?.total ?? 0} icon={Activity} color="bg-primary/10 text-primary" />
        <StatCard label="Average Risk Score" value={stats?.avgScore ?? 0} icon={TrendingUp} color="bg-warning/10 text-warning" />
        <StatCard label="URL Scans" value={stats?.urlCount ?? 0} icon={ScanLine} color="bg-primary/10 text-primary" />
        <StatCard label="Message Scans" value={stats?.messageCount ?? 0} icon={MessageSquareWarning} color="bg-primary/10 text-primary" />
      </div>

      {/* Risk distribution + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk distribution */}
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Breakdown by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-3">
                {[
                  { label: 'Low', count: stats!.low, color: 'bg-success', textColor: 'text-success' },
                  { label: 'Medium', count: stats!.medium, color: 'bg-warning', textColor: 'text-warning' },
                  { label: 'High', count: stats!.high, color: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
                  { label: 'Critical', count: stats!.critical, color: 'bg-danger', textColor: 'text-danger' },
                ].map((item) => {
                  const pct = stats!.total > 0 ? (item.count / stats!.total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold ${item.textColor}`}>{item.count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No analyses yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent analyses */}
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Analyses</CardTitle>
              <CardDescription>Your latest scans</CardDescription>
            </div>
            {hasData && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/history">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-2">
                {recent.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/history/${r.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${riskColor(r.score)}15`, color: riskColor(r.score) }}
                    >
                      {r.type === 'url' ? <ScanLine className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {r.type === 'url' ? r.input : r.input.slice(0, 60) + (r.input.length > 60 ? '…' : '')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color: riskColor(r.score) }}>
                        {r.score}
                      </span>
                      <RiskBadge level={r.risk_level} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No analyses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your security analysis history will appear here after you scan your first URL or message.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/url-scanner">Scan a URL</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/message-scanner">Scan a Message</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> Automated analysis can identify suspicious indicators, but no
          automated system can guarantee that a website or message is completely safe. Always apply
          judgment and verify through trusted channels.
        </p>
      </div>
    </div>
  );
}
