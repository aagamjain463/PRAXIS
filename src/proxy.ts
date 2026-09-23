import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";

const protectedPrefixes = [
  "/today",
  "/inbox",
  "/library",
  "/actions",
  "/ask",
  "/goals",
  "/collections",
  "/analytics",
  "/notifications",
  "/profile",
  "/weekly-review",
  "/settings",
  "/onboarding",
  "/admin"
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!hasSupabaseEnv()) {
    if (isProtected) return NextResponse.redirect(new URL("/login?setup=1", request.url));
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (isProtected && !data.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  if (data.user && isProtected) {
    const { data: profile } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", data.user.id).single();
    if (!profile?.onboarding_completed_at && request.nextUrl.pathname !== "/onboarding") return NextResponse.redirect(new URL("/onboarding", request.url));
    if (profile?.onboarding_completed_at && request.nextUrl.pathname === "/onboarding") return NextResponse.redirect(new URL("/today", request.url));
  }

  if (data.user && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
