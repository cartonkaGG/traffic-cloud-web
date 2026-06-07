import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { SESSION_REVOKED_EVENT } from '@/lib/authSession'

export function SessionRevokedListener(): null {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { pushToast } = useToast()

  useEffect(() => {
    const onRevoked = (): void => {
      logout()
      pushToast('Вхід виконано з іншого пристрою. Увійдіть знову.', 'info')
      navigate('/auth?reason=session_revoked', { replace: true })
    }
    window.addEventListener(SESSION_REVOKED_EVENT, onRevoked)
    return () => window.removeEventListener(SESSION_REVOKED_EVENT, onRevoked)
  }, [logout, navigate, pushToast])

  return null
}
