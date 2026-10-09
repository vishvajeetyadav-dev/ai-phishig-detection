'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ScanLine,
  MessageSquareWarning,
  Brain,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Eye,
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">PhishGuard</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#indicators" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Detection
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {!loading && user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-sm [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-30" />
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Activity className="h-4 w-4" />
              Rule-Based Security Analysis Engine
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Detect Phishing Before
              <br />
              <span className="text-primary">It Reaches You</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Analyze suspicious URLs and messages with a transparent, explainable risk scoring
              system. Get instant risk assessments with detailed indicators and actionable
              recommendations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Scanning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Secure email and password authentication.
            </p>
          </div>

          {/* Visual mockup */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-primary" />
                  <span className="font-semibold">URL Analysis Result</span>
                </div>
                <span className="rounded-full border border-danger/30 bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger">
                  Critical Risk
                </span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-danger" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-danger">82<span className="text-sm text-muted-foreground">/100</span></span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {['Uses IP address instead of domain', 'Insecure HTTP connection', 'Suspicious keywords: login, verify, account', 'URL redirection parameter detected'].map((ind) => (
                    <div key={ind} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                      <span className="text-muted-foreground">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to stay protected</h2>
          <p className="mt-4 text-muted-foreground">
            A comprehensive phishing detection toolkit with transparent methodology and real,
            database-driven history.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ScanLine, title: 'URL Scanner', desc: 'Analyze any URL for phishing indicators including IP addresses, punycode domains, suspicious keywords, redirection parameters, and more.' },
            { icon: MessageSquareWarning, title: 'Message Scanner', desc: 'Paste suspicious emails, SMS, or social media messages. Detect urgency tactics, credential requests, impersonation, and social engineering.' },
            { icon: Brain, title: 'Explainable Scoring', desc: 'Every risk score from 0–100 comes with a clear breakdown of which indicators were detected and why, so you understand the assessment.' },
            { icon: History, title: 'Analysis History', desc: 'Every scan is saved to your account. Search, filter, and review past analyses with full detail views — all private to you.' },
            { icon: Lock, title: 'Secure by Design', desc: 'Password hashing, row-level security, and per-user data isolation. Your analyses are only visible to you — never to other users.' },
            { icon: Eye, title: 'Real Insights', desc: 'Dashboard statistics calculated from your actual scan history. No fake numbers — see your real security posture over time.' },
          ].map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">Three simple steps from suspicious to secure.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up with your email and a secure password. Your account is protected with hashed passwords and encrypted sessions.' },
              { step: '02', title: 'Analyze a URL or message', desc: 'Paste a suspicious URL or message into the scanner. The engine evaluates dozens of indicators in real time.' },
              { step: '03', title: 'Review and act', desc: 'Get a risk score, detected indicators, explanation, and recommended action. Every scan is saved for future reference.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-bold text-primary/20">{s.step}</div>
                <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Indicators section */}
      <section id="indicators" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transparent detection methodology</h2>
            <p className="mt-4 text-muted-foreground">
              PhishGuard does not claim to use an external AI model. It uses a transparent,
              rule-based security analysis engine that checks for known phishing patterns and
              assigns weighted scores. Every indicator is visible to you in the results.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> Automated analysis can
                identify suspicious indicators, but no automated system can guarantee that a
                website or message is completely safe. Always apply judgment and verify through
                trusted channels.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              'IP address instead of domain',
              'Punycode / homograph domains',
              'Excessive subdomains',
              'Suspicious TLDs',
              'URL-encoded characters',
              'Redirection parameters',
              'Keyword impersonation',
              'Insecure HTTP protocol',
              'Urgency & threat language',
              'Credential requests',
              'OTP / verification code requests',
              'Payment & gift card requests',
              'Impersonation of brands',
              'Reward / prize scams',
              'Suspicious shortened links',
              'Malicious file attachments',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Start protecting yourself today</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Create a free account and run your first phishing analysis in under a minute.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-6 bg-background text-foreground hover:bg-background/90">
            <Link href="/register">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold">PhishGuard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Phishing Detection & Security Analysis Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
