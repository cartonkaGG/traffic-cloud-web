import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { apiLogin, apiRegister, type UserRole } from '@/lib/api'
import {
  clearAccessSession,
  getAccessToken,
  getStoredEmail,
  getStoredRole,
  setAccessSession,
  setStoredRole
} from '@/lib/authSession'

type AuthContextValue = {
  isAuthenticated: boolean
  email: string | null
  role: UserRole
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string
  ) => Promise<{ needsEmailVerification: boolean; emailSent?: boolean; emailError?: string }>
  logout: () => void
  setRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [email, setEmail] = useState<string | null>(() => getStoredEmail())
  const [role, setRoleState] = useState<UserRole>(() => getStoredRole() ?? 'user')

  const setRole = useCallback((next: UserRole) => {
    setStoredRole(next)
    setRoleState(next)
  }, [])

  const login = useCallback(async (e: string, password: string) => {
    const res = await apiLogin({ email: e.trim(), password })
    const userRole = res.user.role ?? 'user'
    setAccessSession(res.token, res.user.email, userRole)
    setEmail(res.user.email)
    setRole(userRole)
  }, [setRole])

  const register = useCallback(async (e: string, password: string) => {
    const res = await apiRegister({ email: e.trim().toLowerCase(), password })
    if ('needsEmailVerification' in res && res.needsEmailVerification) {
      return {
        needsEmailVerification: true,
        emailSent: res.emailSent !== false,
        emailError: 'emailError' in res ? res.emailError : undefined
      }
    }
    const auth = res as { token: string; user: { email: string; role?: UserRole } }
    const userRole = auth.user.role ?? 'user'
    setAccessSession(auth.token, auth.user.email, userRole)
    setEmail(auth.user.email)
    setRole(userRole)
    return { needsEmailVerification: false }
  }, [setRole])

  const logout = useCallback(() => {
    clearAccessSession()
    setEmail(null)
    setRoleState('user')
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(email && getAccessToken()),
      email,
      role,
      isAdmin: role === 'admin',
      login,
      register,
      logout,
      setRole
    }),
    [email, role, login, register, logout, setRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
