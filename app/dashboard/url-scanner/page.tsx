'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { AnalysisRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResultView } from '@/components/analysis-result-view';
import { ScanLine, Loader2, Shield, AlertCircle } from 'lucide-react';

export default function UrlScannerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisRecord | null>(null);

  const displayName = (user?.user_metadata?.name as string) ?? 'there';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL to analyze.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
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
        setError(parsed.error ?? 'Unable to analyze URL. Please try again.');
        setLoading(false);
        return;
      }

      if (!parsed.analysis) {
        setError('The analysis service returned an incomplete response. Please try again.');
        setLoading(false);
        return;
      }

      setResult(parsed.analysis);
      setUrl('');
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
          <ScanLine className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">URL Scanner</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Enter a suspicious URL to analyze it for phishing and security-risk indicators, {displayName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input form */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Analyze a URL</CardTitle>
              <CardDescription>
                The scanner checks for suspicious domain patterns, IP addresses, encoding, redirects, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="url"
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      className="pl-9"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !url.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Analyze URL
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
                  'HTTP vs HTTPS',
                  'IP address as hostname',
                  'Excessive subdomains',
                  'Punycode / homograph domains',
                  'URL-encoded characters',
                  'Redirection parameters',
                  'Suspicious keywords',
                  'Frequently-abused TLDs',
                  'Lookalike domain patterns',
                  'Unusual URL length',
                  'Dangerous file types',
                  'Multiple hyphens in domain',
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
                <ScanLine className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm font-medium">No analysis yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a URL above and click &quot;Analyze URL&quot; to see the results here.
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
