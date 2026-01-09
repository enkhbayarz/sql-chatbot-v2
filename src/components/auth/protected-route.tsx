import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useAuth } from '@/lib/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isInitialized } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect after initialization is complete
    if (isInitialized && !token) {
      navigate({ to: '/auth/login' })
    }
  }, [token, isInitialized, navigate])

  // Show nothing while initializing or if no token
  if (!isInitialized || !token) {
    return null
  }

  return <>{children}</>
}
