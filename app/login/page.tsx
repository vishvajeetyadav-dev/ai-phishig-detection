'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestGuard from '@/components/guest-guard';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'check-email') {
      setInfo('Account created! Please check your email to confirm your account, then sign in.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    let result;
    try {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch {
      setLoading(false);
      setError('Unable to reach the authentication service. Please check your connection and try again.');
      return;
    }

    const { error: signInError } = result;

    if (signInError) {
      setLoading(false);
      const msg = signInError.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setError('Invalid email or password. Please check your details and try again.');
      } else if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox for a confirmation link.');
      } else if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        setError('Too many sign-in attempts. Please wait a moment and try again.');
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.push('/dashboard');
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {info && !error && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {info}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1">
          {/* Left panel */}
          <div className="hidden flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl font-bold">PhishGuard</span>
            </Link>
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Secure your digital world against phishing attacks.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Analyze URLs and messages with a transparent, explainable risk scoring engine.
                Every scan is saved to your private history.
              </p>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Phishing Detection & Security Analysis Platform
            </p>
          </div>

          {/* Right panel - form */}
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md">
              <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <div className="mb-6 flex items-center gap-2 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">PhishGuard</span>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
