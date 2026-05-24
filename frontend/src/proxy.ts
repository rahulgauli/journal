import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  const isProtected =
    request.nextUrl.pathname.startsWith("/write") ||
    request.nextUrl.pathname === "/";

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in, don't show login page
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/write/:path*", "/login"],
};
