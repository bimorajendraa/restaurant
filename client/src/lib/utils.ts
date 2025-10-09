import { clsx, type ClassValue } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { EntityError } from './http'
import { toast } from '@/components/ui/use-toast'
import authApi from '@/apiRequests/auth'
import jwt from 'jsonwebtoken'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import envConfig from '@/config'
import { TokenPayload } from '@/types/jwt.types'
import guestApi from '@/apiRequests/guest'
import { format } from 'date-fns'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'

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
  // 1. Lấy token hiện tại từ localStorage
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return

  // 2. Decode để đọc exp (thời gian hết hạn) & iat (thời gian tạo)
  const decodeAccessToken = decodeToken(accessToken)
  const decodeRefreshToken = decodeToken(refreshToken)

  // 3. Lấy thời gian hiện tại (giây)
  const currentTime = new Date().getTime() / 1000 - 1

  // 4. Nếu refresh token đã hết hạn → clear token + gọi onError
  if (decodeRefreshToken.exp <= currentTime) {
    console.log('refresh token hết hạn')
    removeAccessTokenFromLocalStorage()
    removeRefreshTokenFromLocalStorage()
    return onError && onError()
  }

  // 5. Nếu access token còn < 1/3 thời gian sống → gọi API refresh
  if (decodeAccessToken.exp - currentTime < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
    try {
      console.log('access token sắp hết hạn')
      const role = decodeAccessToken.role
      const res = role === Role.Guest ? await guestApi.refreshToken() : await authApi.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      onSuccess && onSuccess()
    } catch (error) {
      onError && onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(number)
}

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã phục vụ'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Pending:
      return 'Chờ xử lý'
    case OrderStatus.Processing:
      return 'Đang nấu'
    default:
      return 'Từ chối'
  }
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()))
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy')
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins,
}
