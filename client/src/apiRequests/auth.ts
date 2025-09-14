import http from '@/lib/http'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from '@/schemas/auth.schema'

const authApiRequests = {
  refreshTokenRequest: null as Promise<{
    status: number
    payload: RefreshTokenResType
  }> | null,
  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body), // server backend của dự án
  login: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, {
      baseUrl: '',
    }),
  // gọi tới route handler
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      '/auth/logout',
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    ),
  logout: () =>
    http.post('/api/auth/logout', null, {
      baseUrl: '',
    }),
  sRefreshToken: (body: RefreshTokenBodyType) => http.post<RefreshTokenResType>('/auth/refresh-token', body),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest
    }
    this.refreshTokenRequest = this.refreshTokenRequest = http.post<RefreshTokenResType>(
      '/api/auth/refresh-token',
      null,
      {
        baseUrl: '',
      },
    )
    const result = await this.refreshTokenRequest
    this.refreshTokenRequest = null
    return result
  },
}

export default authApiRequests
