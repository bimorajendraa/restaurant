import { clsx, type ClassValue } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { EntityError } from './http'
import { toast } from '@/components/ui/use-toast'
import authApiRequests from '@/apiRequests/auth'
import jwt from 'jsonwebtoken'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message,
      })
    })
  } else {
    toast({
      title: 'Lỗi',
      description: error?.payload?.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration: duration ?? 5000,
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('accessToken') : null
}

export const setAccessTokenToLocalStorage = (token: string) => {
  return isBrowser ? localStorage.setItem('accessToken', token) : null
}

export const getRefreshTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('refreshToken') : null
}

export const setRefreshTokenToLocalStorage = (token: string) => {
  return isBrowser ? localStorage.setItem('refreshToken', token) : null
}

export const removeAccessTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.removeItem('accessToken') : null
}

export const removeRefreshTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.removeItem('refreshToken') : null
}

export const checkAndRefreshToken = async ({
  onError,
  onSuccess,
}: {
  onError?: () => void
  onSuccess?: () => void
}) => {
  // để bên trong hàm để mỗi lần gọi hàm sẽ lấy token mới nhất
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return

  const decodeAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
  const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number; iat: number }

  // không nên làm tròn thời gian hết hạn
  const currentTime = new Date().getTime() / 1000 - 1 // new Date() trả về mili giây nên chia 1000 để ra giây và trừ 1 giây để tránh trường hợp thời gian hiện tại trùng với thời gian hết hạn

  if (decodeRefreshToken.exp <= currentTime) {
    removeAccessTokenFromLocalStorage()
    removeRefreshTokenFromLocalStorage()
    return onError && onError()
  }

  // kiểm tra 1/3 thời gian còn lại của accessToken để refresh token
  // thời gian còn lại được tính bằng công thức decodeAccessToken.exp - currentTime
  // thời gian hết hạn của accessToken là decodeAccessToken.exp - decodeAccessToken.iat

  if (decodeAccessToken.exp - currentTime < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
    try {
      const res = await authApiRequests.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      onSuccess && onSuccess()
    } catch (error) {
      onError && onError()
    }
  }
}
