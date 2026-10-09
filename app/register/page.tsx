'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GuestGuard from '@/components/guest-guard';
import { ShieldCheck, Loader2, ArrowLeft, Check } from 'lucide-react';

function passwordChecks(pw: string) {
  return [
    { label: 'At least 8 characters', met: pw.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pw) },
    { label: 'One lowercase letter', met: /[a-z]/.test(pw) },
    { label: 'One number', met: /[0-9]/.test(pw) },
  ];
}

function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!checks.every((c) => c.met)) {
      setError('Please meet all password requirements.');
      return;
    }

    setLoading(true);

    let result;
    try {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() },
        },
      });
    } catch {
      setLoading(false);
      setError('Unable to reach the authentication service. Please check your connection and try again.');
      return;
    }

    const { data, error: signUpError } = result;

    if (signUpError) {
      setLoading(false);
      const msg = signUpError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (msg.includes('password')) {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.session) {
      router.push('/dashboard');
    } else {
      // Email confirmation may be required — redirect to login with a message
      router.push('/login?message=check-email');
    }
  }

  return (
    <Card className="border-border/60 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start analyzing suspicious URLs and messages in minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>
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
              autoComplete="new-password"
              required
            />
            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {checks.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-success' : 'text-muted-foreground'}`}
                  >
                    <Check className={`h-3 w-3 ${c.met ? 'opacity-100' : 'opacity-30'}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1">
          <div className="hidden flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl font-bold">PhishGuard</span>
            </Link>
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Join thousands protecting themselves from phishing.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Get transparent risk scores, detailed indicator breakdowns, and a complete
                analysis history — all secured with row-level database isolation.
              </p>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Phishing Detection & Security Analysis Platform
            </p>
          </div>

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
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
