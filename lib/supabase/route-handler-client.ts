import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase server client for a Route Handler.
 *
 * Middleware is responsible for refreshing the Supabase session and writing
 * refreshed cookies to the response. Route handlers only need to read the
 * request cookies to authenticate the current request.
 */
export function createRouteHandlerClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {
        // Session refresh is handled by middleware before this route runs.
        // Route handlers should not mutate the incoming request cookie store.
      },
    },
  });
}
