import { useAppContext } from '@/components/app-provider'
import { handleErrorApi } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const UNAUTHENTICATED_PATH = ['/login', '/register', '/refresh-token']

export default function LogoutSocket() {
  const pathname = usePathname()
  const router = useRouter()
  const { mutateAsync, isPending } = useLogoutMutation()

  const { setRole, socket, disconnectSocket } = useAppContext()

  useEffect(() => {
    if (UNAUTHENTICATED_PATH.includes(pathname)) return

    async function onLogout() {
      if (isPending) return
      try {
        await mutateAsync()
        setRole(undefined)
        disconnectSocket()
        router.push('/')
      } catch (error) {
        handleErrorApi({
          error,
        })
      }
    }

    socket?.on('logout', onLogout)

    return () => {
      socket?.off('logout', onLogout)
    }
  }, [disconnectSocket, isPending, mutateAsync, pathname, router, setRole, socket])
  return null
}
