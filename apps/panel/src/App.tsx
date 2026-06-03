import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { AccountsPage } from './pages/AccountsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuthPage } from './pages/AuthPage'
import { BrowserProfilesPage } from './pages/BrowserProfilesPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { DashboardPage } from './pages/DashboardPage'
import { FiltersPage } from './pages/FiltersPage'
import { HumanizationPage } from './pages/HumanizationPage'
import { LogsPage } from './pages/LogsPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProxyPage } from './pages/ProxyPage'
import { SettingsPage } from './pages/SettingsPage'
import { SourcesPage } from './pages/SourcesPage'

function Protected({
  children,
  invert = false
}: {
  children: ReactNode
  invert?: boolean
}): JSX.Element {
  const { isAuthenticated } = useAuth()
  if (invert && isAuthenticated) return <Navigate to="/" replace />
  if (!invert && !isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <Protected invert>
            <AuthPage />
          </Protected>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="browser" element={<BrowserProfilesPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="proxy" element={<ProxyPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="humanization" element={<HumanizationPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
