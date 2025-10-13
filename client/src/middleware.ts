import { Role } from '@/constants/type'
import { decodeToken } from '@/lib/utils'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const managePaths = ['/manage']
const guestPaths = ['/guest']
const adminPaths = ['/manage/accounts']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Case 1: Chưa đăng nhập mà truy cập vào trang private path
  if (!refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  // Case 2: Đã đăng nhập
  if (refreshToken) {
    // Case 2.1: Đã đăng nhập mà truy cập vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Case 2.2: Access token hết hạn, refresh token còn hạn
    if (!accessToken && privatePaths.some((path) => pathname.startsWith(path))) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken as string)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Case 2.3: Truy cập không đúng role sẽ bị redirect về trang chủ
    // - required accessToken
    if (accessToken) {
      const role = decodeToken(accessToken).role
      // Khách hàng(guest) không được truy cập trang quản lý(employee, owner)
      const isGuestToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
      // Quản lý(employee) không được truy cập trang khách(guest)
      const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
      // Quản lý(employee) không được truy cập trang admin(owner)
      const isNotAdminToAdminPath = role !== Role.Owner && adminPaths.some((path) => pathname.startsWith(path))

      if (isGuestToManagePath || isNotGuestGoToGuestPath || isNotAdminToAdminPath) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/manage/:path*', '/guest/:path*'],
}
