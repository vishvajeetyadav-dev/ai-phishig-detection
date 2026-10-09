import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';
import type { AnalysisRecord } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(req);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to perform this action.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10) || 10));
    const riskLevel = searchParams.get('riskLevel');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') ?? 'created_at';
    const order = searchParams.get('order') ?? 'desc';

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .range(from, to);

    if (riskLevel && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskLevel)) {
      query = query.eq('risk_level', riskLevel);
    }

    if (type && ['url', 'message'].includes(type)) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`input.ilike.%${search}%,explanation.ilike.%${search}%`);
    }

    const validSorts = ['created_at', 'score', 'risk_level', 'type'];
    const sortCol = validSorts.includes(sort) ? sort : 'created_at';
    query = query.order(sortCol, { ascending: order === 'asc' });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Unable to load analyses. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analyses: (data ?? []) as AnalysisRecord[],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to complete the request right now. Please try again.' },
      { status: 500 }
    );
  }
}
