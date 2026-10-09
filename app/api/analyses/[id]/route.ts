import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Unable to load analysis. Please try again.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Analysis not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis: data });
  } catch {
    return NextResponse.json(
      { error: 'Unable to complete the request right now. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error, count } = await supabase
      .from('analyses')
      .delete({ count: 'exact' })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Unable to delete analysis. Please try again.' },
        { status: 500 }
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { error: 'Analysis not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Unable to complete the request right now. Please try again.' },
      { status: 500 }
    );
  }
}
