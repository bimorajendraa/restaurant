/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RefreshToken from './refresh-token'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  decodeToken,
  getAccessTokenFromLocalStorage,
  removeAccessTokenFromLocalStorage,
  removeRefreshTokenFromLocalStorage,
} from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { Socket } from 'socket.io-client'
import { socketInstance } from '@/lib/socket'
import LogoutSocket from '@/components/logout-socket'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {},
  socket: undefined as Socket | undefined,
  setSocket: (socket: Socket | undefined) => {},
  disconnectSocket: () => {},
})
export const useAppContext = () => useContext(AppContext)

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>(undefined)
  const [role, setRoleState] = useState<RoleType | undefined>(undefined)
  const count = useRef(0)

  useEffect(() => {
    if (count.current === 0) {
      const accessToken = getAccessTokenFromLocalStorage()
      if (accessToken) {
        const role = decodeToken(accessToken).role
        setRoleState(role)
        setSocket(socketInstance(accessToken))
      }
      count.current += 1
    }
  }, [])

  const setRole = useCallback((role?: RoleType | undefined) => {
    if (role) {
      setRoleState(role)
    } else {
      setRoleState(undefined)
      removeAccessTokenFromLocalStorage()
      removeRefreshTokenFromLocalStorage()
    }
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socket?.connected) {
      socket.disconnect()
    }
    setSocket(undefined)
  }, [socket])

  const isAuth = Boolean(role)

  //react19 and nextjs 15 don't need AppContext.Provider
  return (
    <AppContext value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <LogoutSocket />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext>
  )
}
