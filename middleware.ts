import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Presence-only check in middleware (Edge runtime has no Node crypto).
// Full HMAC verification still happens in DashboardLayout via lib/auth/session.ts.
export function middleware(request: NextRequest) {
  const session = request.cookies.get("askhero_session");

  if (!session?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
