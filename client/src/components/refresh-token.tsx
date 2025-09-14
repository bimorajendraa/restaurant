'use client'

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import jwt from 'jsonwebtoken'
import authApiRequests from '@/apiRequests/auth'

const UNAUTHENTICATED_PATH = ['/login', '/register', '/forgot-password', '/reset-password', '/refresh-token']

export default function RefreshToken() {
  const pathname = usePathname()
  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return
    let interval: any = null

    const checkRefreshToken = async () => {
      // để bên trong hàm để mỗi lần gọi hàm sẽ lấy token mới nhất
      const accessToken = getAccessTokenFromLocalStorage()
      const refreshToken = getRefreshTokenFromLocalStorage()
      if (!accessToken || !refreshToken) return

      const decodeAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
      const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number; iat: number }

      const currentTime = Math.round(new Date().getTime() / 1000) // new Date() trả về mili giây nên chia 1000 để ra giây

      if (decodeRefreshToken.exp < currentTime) return

      // kiểm tra 1/3 thời gian còn lại của accessToken để refresh token
      // thời gian còn lại được tính bằng công thức decodeAccessToken.exp - currentTime
      // thời gian hết hạn của accessToken là decodeAccessToken.exp - decodeAccessToken.iat

      if (decodeAccessToken.exp - currentTime < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
        try {
          const res = await authApiRequests.refreshToken()
          setAccessTokenToLocalStorage(res.payload.data.accessToken)
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
        } catch (error) {
          clearInterval(interval)
        }
      }
    }
    // Phải gọi lần đầu tiên, vì interval phải đợi TIMEOUT mới chạy
    checkRefreshToken()
    // TIMEOUT phải bé hơn thời gian accessToken hết hạn
    const TIMEOUT = 1000
    interval = setInterval(checkRefreshToken, TIMEOUT)
    return () => {
      clearInterval(interval)
    }
  }, [pathname])
  return <div>RefreshToken</div>
}
