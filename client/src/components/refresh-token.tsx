'use client'

import socket from '@/lib/socket'
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
    const onRefreshToken = (force?: boolean) =>
      checkAndRefreshToken({
        force,
        onError: () => {
          clearInterval(interval)
          router.push('/login')
        },
      })
    onRefreshToken()
    // TIMEOUT phải bé hơn thời gian accessToken hết hạn
    const TIMEOUT = 300000
    interval = setInterval(() => onRefreshToken(), TIMEOUT)

    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket.id)
    }

    function onDisconnect() {
      console.log('disconnected from server')
    }

    function onRefreshTokenSocket() {
      onRefreshToken(true)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('refresh-token', onRefreshTokenSocket)

    return () => {
      clearInterval(interval)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('refresh-token', onRefreshTokenSocket)
    }
  }, [pathname, router])
  return null
}
