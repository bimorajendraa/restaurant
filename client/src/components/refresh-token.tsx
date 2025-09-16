'use client'

import { checkAndRefreshToken } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const UNAUTHENTICATED_PATH = ['/login', '/register', '/forgot-password', '/reset-password', '/refresh-token']

export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return
    let interval: any = null

    // Phải gọi lần đầu tiên, vì interval phải đợi TIMEOUT mới chạy
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval)
        router.push('/login')
      },
    })
    // TIMEOUT phải bé hơn thời gian accessToken hết hạn
    const TIMEOUT = 5000
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval)
            router.push('/login')
          },
        }),
      TIMEOUT,
    )
    return () => {
      clearInterval(interval)
    }
  }, [pathname, router])
  return null
}
