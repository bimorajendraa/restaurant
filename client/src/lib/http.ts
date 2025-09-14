/* eslint-disable @typescript-eslint/no-explicit-any */

import envConfig from '@/config'
import { LoginResType } from '@/schemas/auth.schema'
import { redirect } from 'next/navigation'
import {
  normalizePath,
  removeAccessTokenFromLocalStorage,
  removeRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from './utils'

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined
}

const ENTITY_ERROR_STATUS = 422
const AUTHENTICATION_ERROR_STATUS = 401

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

export class HttpError extends Error {
  status: number
  payload: {
    message: string
    [key: string]: any
  }
  constructor({ status, payload, message = 'HTTP Error' }: { status: number; payload: any; message?: string }) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS
  payload: EntityErrorPayload
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS; payload: EntityErrorPayload }) {
    super({ status, payload, message: 'Entity Error' })
    this.status = status
    this.payload = payload
  }
}

const isClient = typeof window !== 'undefined'

let clientLogoutRequest: null | Promise<any> = null

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: CustomOptions | undefined,
) => {
  let body: FormData | string | undefined = undefined

  // xử lí body
  if (options?.body instanceof FormData) {
    body = options.body
  } else if (options?.body) {
    body = JSON.stringify(options.body)
  }

  // xử lí headers
  const baseHeaders: {
    [key: string]: string
  } =
    body instanceof FormData
      ? {}
      : {
          'Content-Type': 'application/json',
        }

  if (isClient) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`
    }
  }

  // xử lí URL
  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.DOCKER_PUBLIC_API_ENDPOINT || envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl
  const fullUrl = `${baseUrl}/${normalizePath(url)}`
  // console.log('fullUrl:', fullUrl)
  // gửi request
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  })

  const payload: Response = await res.json()
  const data = {
    status: res.status,
    payload,
  }
  //_____________interceptor_______________//
  // nếu có lỗi trong quá trình request
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      //422
      throw new EntityError(
        data as {
          status: 422
          payload: EntityErrorPayload
        },
      )
      //handle 401 token is expired
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      //401
      if (isClient) {
        //lỗi 401 khi chạy ở client
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch('/api/auth/logout', {
            //logout route handler
            method: 'POST',
            body: null, //Logout cho phep luon luon thanh cong
            headers: {
              ...baseHeaders,
            } as any,
          })

          try {
            await clientLogoutRequest
          } catch (error) {
            console.log(error)
          } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            clientLogoutRequest = null
            //redirect to login can make infinite loop error
            location.href = '/login'
          }
        }
      } else {
        //lỗi 401 khi chạy ở server
        const accessToken = (options?.headers as any)?.Authorization.split(' ')[1]
        redirect(`/logout?accessToken=${accessToken}`)
      }
    } else {
      throw new HttpError(data)
    }
  }

  if (isClient) {
    const normalizeURL = normalizePath(url)
    if (normalizeURL === 'api/auth/login') {
      const { accessToken, refreshToken } = (payload as LoginResType).data
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
    } else if (normalizeURL === 'api/auth/logout') {
      removeAccessTokenFromLocalStorage()
      removeRefreshTokenFromLocalStorage()
    }
  }

  return data
}

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'> | undefined) {
    return request<Response>('GET', url, options)
  },

  post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'> | undefined) {
    return request<Response>('POST', url, { ...options, body })
  },

  put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'> | undefined) {
    return request<Response>('PUT', url, { ...options, body })
  },

  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'> | undefined) {
    return request<Response>('DELETE', url, { ...options })
  },
}

export default http
