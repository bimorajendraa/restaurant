import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];

const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = Boolean(request.cookies.get("accessToken")?.value);

  if (!isAuth && privatePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && unAuthPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/login", "/manage/:path*"],
};
