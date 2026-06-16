import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/interview", "/feedback", "/create"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) return NextResponse.next();

  // Check for Firebase session cookie (set by AuthProvider after sign-in)
  const session = request.cookies.get("session")?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/feedback/:path*",
    "/create/:path*",
    "/admin/:path*",
  ],
};
