'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  ShieldCheck,
  LayoutDashboard,
  ScanLine,
  MessageSquareWarning,
  History,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  Loader2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/url-scanner', label: 'URL Scanner', icon: ScanLine },
  { href: '/dashboard/message-scanner', label: 'Message Scanner', icon: MessageSquareWarning },
  { href: '/dashboard/history', label: 'Analysis History', icon: History },
  { href: '/dashboard/insights', label: 'Security Insights', icon: Lightbulb },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    router.push('/login');
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground hover:text-destructive"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Sign Out
    </Button>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const displayName = (user?.user_metadata?.name as string) ?? user?.email ?? 'User';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">PhishGuard</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <div className="flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="ml-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">PhishGuard</span>
        </Link>
      </div>
    </>
  );
}
