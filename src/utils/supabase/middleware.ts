import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on each request and writes any rotated
 * session cookies back onto the response. This is the standard @supabase/ssr
 * middleware helper.
 *
 * IMPORTANT: do not run code between creating the client and calling
 * `supabase.auth.getUser()`, and always return the `supabaseResponse` object
 * unmodified so the refreshed cookies survive.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the auth token. Do NOT remove this call.
  await supabase.auth.getUser();

  // No auth-gated routes yet — this is a public landing page, so we simply
  // refresh the session and return. Add redirect logic here later if needed.

  return supabaseResponse;
}
