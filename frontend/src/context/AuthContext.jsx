import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '../api/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Comprobar la sesión activa con el backend mediante cookies HttpOnly
  useEffect(() => {
    let mounted = true

    async function checkSession() {
      try {
        await authService.getCsrf()
        const userData = await authService.getMe()
        if (mounted) {
          setUser(userData)
        }
      } catch {
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkSession()

    // Escuchar expiración de sesión (401)
    const handleUnauthorized = () => {
      setUser(null)
    }
    window.addEventListener('abastix:unauthorized', handleUnauthorized)

    return () => {
      mounted = false
      window.removeEventListener('abastix:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const userData = await authService.login(email, password)
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setLoading(false)
    }
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isEmployee = user?.role === 'ROLE_EMPLEADO' || isAdmin

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isEmployee,
        loading,
        isCheckingAuth,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
