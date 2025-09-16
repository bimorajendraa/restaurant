import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privatePaths = ['/manage']

const unAuthPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  if (refreshToken && unAuthPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // accessToken hết hạn nên phải refresh token để lấy accessToken và refreshToken mới
  if (!accessToken && refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/refresh-token', request.url)
    url.searchParams.set('refreshToken', refreshToken as string)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/manage/:path*'],
}
