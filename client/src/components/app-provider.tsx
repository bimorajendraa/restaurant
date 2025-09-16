'use client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RefreshToken from './refresh-token'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getAccessTokenFromLocalStorage,
  removeAccessTokenFromLocalStorage,
  removeRefreshTokenFromLocalStorage,
} from '@/lib/utils'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})
const AppContext = createContext({
  isAuth: false,
  setIsAuth: (isAuth: boolean) => {},
})
export const useAppContext = () => useContext(AppContext)

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuthState] = useState<boolean>(false)

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) setIsAuth(true)
  }, [])

  const setIsAuth = useCallback((isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(true)
    } else {
      setIsAuthState(false)
      removeAccessTokenFromLocalStorage()
      removeRefreshTokenFromLocalStorage()
    }
  }, [])
  //react19 and nextjs 15 don't need AppContext.Provider
  return (
    <AppContext value={{ isAuth, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppContext>
  )
}
