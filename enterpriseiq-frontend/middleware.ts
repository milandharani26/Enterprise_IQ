import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The backend sets 'accessToken' and 'refreshToken' cookies
  const hasToken =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  // Protect auth routes: prevent logged-in users from accessing sign-in / sign-up
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    if (request.nextUrl.searchParams.get("clear") === "true") {
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    if (hasToken) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
  }

  // Protect chat route: prevent non-logged-in users from accessing chat
  if (pathname.startsWith("/chat")) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // Redirect root to chat if logged in
  if (pathname === "/") {
    if (hasToken) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/sign-in", "/sign-up"],
};
