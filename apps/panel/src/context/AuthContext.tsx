import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import {
  apiLogin,
  apiRegister,
  apiVerifyLoginCode,
  isLoginChallenge,
  type LoginChallengeResponse,
  type UserRole
} from '@/lib/api'
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
  login: (email: string, password: string) => Promise<LoginChallengeResponse | null>
  completeLoginWithCode: (challengeId: string, code: string) => Promise<void>
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

  const applyAuthResponse = useCallback(
    (token: string, userEmail: string, userRole: UserRole) => {
      setAccessSession(token, userEmail, userRole)
      setEmail(userEmail)
      setRole(userRole)
    },
    [setRole]
  )

  const login = useCallback(async (e: string, password: string) => {
    const res = await apiLogin({ email: e.trim(), password })
    if (isLoginChallenge(res)) return res
    const userRole = res.user.role ?? 'user'
    applyAuthResponse(res.token, res.user.email, userRole)
    return null
  }, [applyAuthResponse])

  const completeLoginWithCode = useCallback(
    async (challengeId: string, code: string) => {
      const res = await apiVerifyLoginCode({ challengeId, code })
      const userRole = res.user.role ?? 'user'
      applyAuthResponse(res.token, res.user.email, userRole)
    },
    [applyAuthResponse]
  )

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
      completeLoginWithCode,
      register,
      logout,
      setRole
    }),
    [email, role, login, completeLoginWithCode, register, logout, setRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
