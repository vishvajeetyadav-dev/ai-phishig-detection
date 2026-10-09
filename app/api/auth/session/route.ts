import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';

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
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: (user.user_metadata?.name as string) ?? user.email,
        },
      },
    });
  } catch {
    return NextResponse.json({ session: null });
  }
}
