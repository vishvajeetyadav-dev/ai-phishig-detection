'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const displayName = (user?.user_metadata?.name as string) ?? '';
  const [name, setName] = useState(displayName);
  const [savingName, setSavingName] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast({ title: 'Invalid name', description: 'Name must be at least 2 characters.', variant: 'destructive' });
      return;
    }

    setSavingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });

    if (error) {
      toast({ title: 'Error', description: 'Unable to update name. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Your name has been updated.' });
    }
    setSavingName(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');

    if (!currentPw || !newPw || !confirmPw) {
      setPwError('Please fill in all password fields.');
      return;
    }

    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }

    if (newPw === currentPw) {
      setPwError('New password must be different from your current password.');
      return;
    }

    setSavingPw(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPw,
    });

    if (updateError) {
      setPwError(updateError.message.includes('password')
        ? 'Password is too weak. Please choose a stronger password.'
        : 'Unable to change password. Please verify your current password is correct.');
      setSavingPw(false);
      return;
    }

    toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setSavingPw(false);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Manage your account profile and security settings.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Update your display name and view your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={savingName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="pl-9 bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" />
                Account secured with hashed password and row-level data isolation.
              </div>

              <Button type="submit" disabled={savingName || name.trim() === displayName}>
                {savingName ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  disabled={savingPw}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="••••••••"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  disabled={savingPw}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  disabled={savingPw}
                  autoComplete="new-password"
                />
              </div>

              {pwError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {pwError}
                </div>
              )}

              <Button type="submit" disabled={savingPw}>
                {savingPw ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security info */}
        <Card className="border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-success" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Your password is securely hashed — it is never stored in plain text.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Your analysis records are protected by row-level security — only you can access them.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Authentication sessions are managed securely and automatically refreshed.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                The URL analyzer performs static analysis only — it does not visit external URLs from the server.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
