import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/services/api'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('admin_token')
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        await authApi.getMe()
      } catch {
        localStorage.removeItem('admin_token')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }
    verifyToken()
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('admin_token', data.access_token)
    setToken(data.access_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
