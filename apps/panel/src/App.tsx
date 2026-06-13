import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useWorkspaceData } from './context/WorkspaceDataContext'
import { useSoftware } from './context/SoftwareContext'
import { hasPanelAccess } from './lib/subscriptionAccess'
import { SessionRevokedListener } from './components/auth/SessionRevokedListener'
import { DesktopUpdateBanner } from './components/desktop/DesktopUpdateBanner'
import { DesktopUpdateOverlay } from './components/desktop/DesktopUpdateOverlay'
import { PanelVersionSync } from './components/layout/PanelVersionSync'
import { AppShell } from './components/layout/AppShell'
import { PanelLoadingScreen } from './components/layout/PanelLoadingScreen'
import { AccountsPage } from './pages/AccountsPage'
import { AuthPage } from './pages/AuthPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { DashboardPage } from './pages/DashboardPage'
import { FiltersPage } from './pages/FiltersPage'
import { InboxPage } from './pages/InboxPage'
import { MessagesPage } from './pages/MessagesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminPage } from './pages/AdminPage'
import { BillingPage } from './pages/BillingPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SoftwareHubPage } from './pages/SoftwareHubPage'
import { SourcesPage } from './pages/SourcesPage'
import { VideoUniquifyPage } from './pages/VideoUniquifyPage'
import { TikTokWarmupPage } from './pages/TikTokWarmupPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { VideoUniquifyShell } from './components/layout/VideoUniquifyShell'
import { TikTokWarmupShell } from './components/layout/TikTokWarmupShell'
import {
  BILLING_SUBSCRIBE_PATH,
  resolvePostAuthPath,
  SUBSCRIBE_ENTRY_PATH
} from './lib/panelRoutes'

function PostAuthRedirect(): JSX.Element {
  const { isAdmin } = useAuth()
  const { subscription, status } = useWorkspaceData()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  if (status === 'loading' && subscription === null) {
    return <PanelLoadingScreen label="Завантаження…" />
  }

  return (
    <Navigate
      to={resolvePostAuthPath(redirectTo, subscription, isAdmin)}
      replace
    />
  )
}

function Protected({
  children,
  invert = false
}: {
  children: ReactNode
  invert?: boolean
}): JSX.Element {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (invert && isAuthenticated) return <PostAuthRedirect />
  if (!invert && !isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }
  return <>{children}</>
}

function RequireSoftware({ children }: { children: ReactNode }): JSX.Element {
  const { selectedSoftwareId } = useSoftware()
  if (!selectedSoftwareId) return <Navigate to="/hub" replace />
  if (selectedSoftwareId === 'video-uniquify') return <Navigate to="/uniquify" replace />
  if (selectedSoftwareId === 'tiktok-warmup') return <Navigate to="/tiktok" replace />
  return <>{children}</>
}

function RequireVideoUniquify({ children }: { children: ReactNode }): JSX.Element {
  const { selectedSoftwareId } = useSoftware()
  if (!selectedSoftwareId) return <Navigate to="/hub" replace />
  if (selectedSoftwareId !== 'video-uniquify') return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireTikTokWarmup({ children }: { children: ReactNode }): JSX.Element {
  const { selectedSoftwareId, selectSoftware } = useSoftware()

  useEffect(() => {
    if (selectedSoftwareId !== 'tiktok-warmup') {
      selectSoftware('tiktok-warmup')
    }
  }, [selectSoftware, selectedSoftwareId])

  if (selectedSoftwareId && selectedSoftwareId !== 'tiktok-warmup') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }): JSX.Element {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/hub" replace />
  return <>{children}</>
}

function RequireSubscription({ children }: { children: ReactNode }): JSX.Element {
  const { isAdmin } = useAuth()
  const { subscription, status } = useWorkspaceData()
  if (status === 'loading' && subscription === null) {
    return <PanelLoadingScreen label="Перевірка підписки…" />
  }
  if (!hasPanelAccess(subscription, isAdmin)) {
    return <Navigate to={BILLING_SUBSCRIBE_PATH} replace />
  }
  return <>{children}</>
}

export default function App(): JSX.Element {
  return (
    <>
      <SessionRevokedListener />
      <PanelVersionSync />
      <DesktopUpdateBanner />
      <DesktopUpdateOverlay />
      <Routes>
      <Route path="/subscribe" element={<Navigate to={SUBSCRIBE_ENTRY_PATH} replace />} />
      <Route
        path="/auth"
        element={
          <Protected invert>
            <AuthPage />
          </Protected>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/hub"
        element={
          <Protected>
            <RequireSubscription>
              <SoftwareHubPage />
            </RequireSubscription>
          </Protected>
        }
      />
      <Route
        path="/billing"
        element={
          <Protected>
            <BillingPage />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected>
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          </Protected>
        }
      />
      <Route
        path="/uniquify"
        element={
          <Protected>
            <RequireVideoUniquify>
              <RequireSubscription>
                <VideoUniquifyShell />
              </RequireSubscription>
            </RequireVideoUniquify>
          </Protected>
        }
      >
        <Route index element={<VideoUniquifyPage />} />
      </Route>
      <Route
        path="/tiktok"
        element={
          <Protected>
            <RequireTikTokWarmup>
              <RequireSubscription>
                <TikTokWarmupShell />
              </RequireSubscription>
            </RequireTikTokWarmup>
          </Protected>
        }
      >
        <Route index element={<Navigate to="accounts" replace />} />
        <Route path="accounts" element={<TikTokWarmupPage />} />
        <Route path="create" element={<TikTokWarmupPage />} />
        <Route path="warmup" element={<TikTokWarmupPage />} />
      </Route>
      <Route
        path="/"
        element={
          <Protected>
            <RequireSoftware>
              <RequireSubscription>
                <AppShell />
              </RequireSubscription>
            </RequireSoftware>
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="browser" element={<Navigate to="/accounts" replace />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="proxy" element={<Navigate to="/accounts" replace />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="humanization" element={<Navigate to="/campaigns" replace />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="analytics" element={<Navigate to="/" replace />} />
        <Route path="logs" element={<Navigate to="/" replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
