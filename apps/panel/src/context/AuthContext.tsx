import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { apiLogin, apiRegister } from '@/lib/api'
import {
  clearAccessSession,
  getAccessToken,
  getStoredEmail,
  setAccessSession
} from '@/lib/authSession'

type AuthContextValue = {
  isAuthenticated: boolean
  email: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [email, setEmail] = useState<string | null>(() => getStoredEmail())

  const login = useCallback(async (e: string, password: string) => {
    const res = await apiLogin({ email: e.trim(), password })
    setAccessSession(res.token, res.user.email)
    setEmail(res.user.email)
  }, [])

  const register = useCallback(async (e: string, password: string) => {
    const res = await apiRegister({ email: e.trim(), password })
    setAccessSession(res.token, res.user.email)
    setEmail(res.user.email)
  }, [])

  const logout = useCallback(() => {
    clearAccessSession()
    setEmail(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(email),
      email,
      login,
      register,
      logout
    }),
    [email, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
