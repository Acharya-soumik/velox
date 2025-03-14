import { createClient } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/auth/callback",
  "/api/auth"
];

// Define paths that require specific checks
const SPECIAL_PATHS = {
  RESUME_NEW: "/resume/new"
};

export async function middleware(request: NextRequest) {
  try {
    // Check if the path is public
    const isPublicPath = PUBLIC_PATHS.some(path => 
      request.nextUrl.pathname === path || 
      request.nextUrl.pathname.startsWith(path)
    );

    // If it's a public path, allow access without authentication
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Create a Supabase client configured to use cookies
    const supabase = createClient(request);

    // Use getUser instead of getSession for secure authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // If the user is not signed in, redirect to sign-in
    if (!user || userError) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Special handling for /resume/new - check if user has a profile
    if (request.nextUrl.pathname === SPECIAL_PATHS.RESUME_NEW) {
      const { data: profile, error: profileError } = await supabase
        .from("resume_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile || profileError) {
        return NextResponse.redirect(new URL("/resume/profile", request.url));
      }
    }

    // Allow the request to continue
    return NextResponse.next();
  } catch (e) {
    console.error("Middleware error:", e);
    // If there's an error, redirect to sign in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
