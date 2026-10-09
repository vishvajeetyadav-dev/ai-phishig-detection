'use client';

import { RiskBadge, riskColor } from '@/components/risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisRecord } from '@/lib/types';
import { AlertTriangle, ShieldCheck, ShieldAlert, Info, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';

export function AnalysisResultView({ analysis }: { analysis: AnalysisRecord }) {
  const color = riskColor(analysis.score);
  const isLow = analysis.risk_level === 'LOW';
  const indicators = Array.isArray(analysis.indicators) ? analysis.indicators : [];
  const createdAt = new Date(analysis.created_at);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? 'Date unavailable'
    : format(createdAt, 'MMM d, yyyy \'at\' h:mm a');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score card */}
      <Card className="overflow-hidden border-border/60">
        <div
          className="h-2"
          style={{ backgroundColor: color }}
        />
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${color}15` }}
              >
                {isLow ? (
                  <ShieldCheck className="h-8 w-8" style={{ color }} />
                ) : (
                  <ShieldAlert className="h-8 w-8" style={{ color }} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold" style={{ color }}>
                    {analysis.score}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <RiskBadge level={analysis.risk_level} className="mt-1" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Analysis type: <span className="font-medium text-foreground capitalize">{analysis.type}</span></p>
              <p className="mt-0.5">Date: <span className="font-medium text-foreground">{formattedDate}</span></p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${analysis.score}%`, backgroundColor: color }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Safe</span>
              <span>Moderate</span>
              <span>Risky</span>
              <span>Critical</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input summary */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Analyzed {analysis.type === 'url' ? 'URL' : 'Message'}</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.type === 'url' ? (
            <p className="break-all rounded-lg bg-muted/50 p-3 font-mono text-sm">{analysis.input}</p>
          ) : (
            <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{analysis.input}</p>
          )}
        </CardContent>
      </Card>

      {/* Detected indicators */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Detected Indicators
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {indicators.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {indicators.length > 0 ? (
            <ul className="space-y-2">
              {indicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg border border-border/50 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <ShieldCheck className="h-4 w-4" />
              No suspicious indicators were detected.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.explanation}</p>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-warning" />
            Recommended Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
            {analysis.recommendation}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground">
        Automated analysis can identify suspicious indicators, but no automated system can guarantee
        that a website or message is completely safe. Always apply judgment and verify through
        trusted channels.
      </p>
    </div>
  );
}
