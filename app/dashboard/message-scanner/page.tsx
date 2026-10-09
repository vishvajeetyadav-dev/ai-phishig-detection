'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { AnalysisRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResultView } from '@/components/analysis-result-view';
import { MessageSquareWarning, Loader2, AlertCircle } from 'lucide-react';

export default function MessageScannerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisRecord | null>(null);

  const displayName = (user?.user_metadata?.name as string) ?? 'there';
  const maxLength = 10000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError('');
    setResult(null);

    if (!message.trim()) {
      setError('Please enter a message to analyze.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setLoading(false);
        router.push('/login');
        return;
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        setError('The analysis service returned an unexpected response. Please try again.');
        setLoading(false);
        return;
      }

      const parsed = data as { error?: string; analysis?: AnalysisRecord };

      if (!res.ok) {
        setError(parsed.error ?? 'Unable to analyze message. Please try again.');
        setLoading(false);
        return;
      }

      if (!parsed.analysis) {
        setError('The analysis service returned an incomplete response. Please try again.');
        setLoading(false);
        return;
      }

      setResult(parsed.analysis);
      setMessage('');
    } catch (requestError) {
      console.error('Analysis request failed:', requestError);
      setError('Unable to connect to the analysis service. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Message Scanner</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Paste a suspicious email, SMS, or message to analyze it for phishing and social engineering indicators, {displayName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input form */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Analyze a Message</CardTitle>
              <CardDescription>
                The scanner detects urgency tactics, credential requests, impersonation, payment scams, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">Message Content</Label>
                    <span className="text-xs text-muted-foreground">
                      {message.length.toLocaleString()} / {maxLength.toLocaleString()}
                    </span>
                  </div>
                  <Textarea
                    id="message"
                    placeholder="Paste the suspicious email, SMS, or message here…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                    disabled={loading}
                    rows={10}
                    className="resize-y"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !message.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <MessageSquareWarning className="mr-2 h-4 w-4" />
                      Analyze Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">What gets checked</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                {[
                  'Urgency & pressure tactics',
                  'Threatening language',
                  'Credential / password requests',
                  'OTP / verification code requests',
                  'Payment & gift card requests',
                  'Brand impersonation',
                  'Reward / prize scams',
                  'Suspicious shortened links',
                  'Personal info requests',
                  'Malicious file attachments',
                  'Poor grammar patterns',
                  'Embedded URL analysis',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <AnalysisResultView analysis={result} />
          ) : (
            <Card className="flex h-full min-h-[400px] flex-col items-center justify-center border-border/60 border-dashed">
              <CardContent className="flex flex-col items-center text-center">
                <MessageSquareWarning className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm font-medium">No analysis yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paste a message above and click &quot;Analyze Message&quot; to see the results here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/history">View All Analyses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
