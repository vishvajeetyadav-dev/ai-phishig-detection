import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';
import { messageAnalysisSchema } from '@/lib/validation';
import { analyzeMessage } from '@/lib/analysis/message-analyzer';
import type { AnalysisRecord } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = messageAnalysisSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

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

    const message = parsed.data.message;
    let result;
    try {
      result = analyzeMessage(message);
    } catch (analysisErr) {
      console.error('[/api/analyze/message] Analyzer error:', analysisErr);
      return NextResponse.json(
        { error: 'Unable to analyze this message right now. Please try again.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        type: 'message',
        input: message,
        score: result.score,
        risk_level: result.riskLevel,
        indicators: result.indicators,
        explanation: result.explanation,
        recommendation: result.recommendation,
      })
      .select()
      .single();

    if (error) {
      console.error('[/api/analyze/message] Database insert error:', error.message, error.code);
      return NextResponse.json(
        { error: 'Unable to save analysis. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: data as AnalysisRecord });
  } catch (err) {
    console.error('[/api/analyze/message] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unable to complete the request right now. Please try again.' },
      { status: 500 }
    );
  }
}
