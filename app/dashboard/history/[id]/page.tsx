'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { AnalysisRecord } from '@/lib/types';
import { AnalysisResultView } from '@/components/analysis-result-view';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const id = params?.id as string;
      if (!id) return;

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setAnalysis(data as AnalysisRecord);
      setLoading(false);
    }

    load();
  }, [params]);

  async function handleDelete() {
    if (!analysis) return;
    setDeleting(true);

    const { error } = await supabase.from('analyses').delete().eq('id', analysis.id);

    if (error) {
      toast({ title: 'Error', description: 'Unable to delete analysis. Please try again.', variant: 'destructive' });
      setDeleting(false);
      return;
    }

    toast({ title: 'Deleted', description: 'Analysis has been removed.' });
    router.push('/dashboard/history');
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-6 lg:p-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold">Analysis not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This analysis may have been deleted or does not belong to your account.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="mx-auto max-w-3xl">
        <AnalysisResultView analysis={analysis} />
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The analysis record will be permanently removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
