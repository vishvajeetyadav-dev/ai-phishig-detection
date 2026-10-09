'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { AnalysisRecord, RiskLevel } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBadge, riskColor } from '@/components/risk-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  History,
  ScanLine,
  MessageSquareWarning,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  ArrowUpDown,
  Eye,
  AlertTriangle,
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (riskFilter !== 'all') {
      query = query.eq('risk_level', riskFilter);
    }
    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }
    if (search) {
      query = query.or(`input.ilike.%${search}%,explanation.ilike.%${search}%`);
    }

    const validSorts = ['created_at', 'score', 'risk_level', 'type'];
    const sortCol = validSorts.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortCol, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;

    if (error) {
      toast({ title: 'Error', description: 'Unable to load analyses. Please try again.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setRecords((data ?? []) as AnalysisRecord[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, riskFilter, typeFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  function handleSearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleFilterChange(value: string, type: 'risk' | 'typeFilter') {
    if (type === 'risk') setRiskFilter(value);
    else setTypeFilter(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    if (value === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('desc');
    }
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const { error } = await supabase.from('analyses').delete().eq('id', deleteId);

    if (error) {
      toast({ title: 'Error', description: 'Unable to delete analysis. Please try again.', variant: 'destructive' });
      setDeleting(false);
      return;
    }

    toast({ title: 'Deleted', description: 'Analysis has been removed.' });
    setDeleteId(null);
    setDeleting(false);

    if (records.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      fetchRecords();
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasData = records.length > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Search, filter, and review your past analyses. {total} total {total === 1 ? 'record' : 'records'}.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by URL or message content…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={riskFilter} onValueChange={(v) => handleFilterChange(v, 'risk')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="CRITICAL">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => handleFilterChange(v, 'typeFilter')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="url">URL Scans</SelectItem>
                  <SelectItem value="message">Message Scans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasData ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => handleSortChange('type')}>
                          Type
                          {sortBy === 'type' && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                      </TableHead>
                      <TableHead>Target / Input</TableHead>
                      <TableHead className="w-[80px]">
                        <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => handleSortChange('score')}>
                          Score
                          {sortBy === 'score' && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => handleSortChange('risk_level')}>
                          Risk
                          {sortBy === 'risk_level' && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                      </TableHead>
                      <TableHead className="w-[160px]">
                        <button className="flex items-center gap-1 font-medium hover:text-foreground" onClick={() => handleSortChange('created_at')}>
                          Date
                          {sortBy === 'created_at' && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                      </TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {r.type === 'url' ? (
                              <ScanLine className="h-4 w-4 text-primary" />
                            ) : (
                              <MessageSquareWarning className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm capitalize">{r.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/history/${r.id}`}
                            className="block max-w-[300px] truncate text-sm font-medium hover:text-primary"
                          >
                            {r.input}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold" style={{ color: riskColor(r.score) }}>
                            {r.score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <RiskBadge level={r.risk_level as RiskLevel} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/dashboard/history/${r.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(r.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-border md:hidden">
                {records.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {r.type === 'url' ? (
                          <ScanLine className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquareWarning className="h-4 w-4 text-primary" />
                        )}
                        <span className="text-xs capitalize text-muted-foreground">{r.type}</span>
                      </div>
                      <RiskBadge level={r.risk_level as RiskLevel} />
                    </div>
                    <Link
                      href={`/dashboard/history/${r.id}`}
                      className="mt-2 block truncate text-sm font-medium hover:text-primary"
                    >
                      {r.input}
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold" style={{ color: riskColor(r.score) }}>
                          Score: {r.score}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/history/${r.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-medium">No analyses found</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {search || riskFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Your security analysis history will appear here after you scan your first URL or message.'}
              </p>
              {!search && riskFilter === 'all' && typeFilter === 'all' && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/url-scanner">Scan a URL</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/message-scanner">Scan a Message</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
              onClick={confirmDelete}
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
