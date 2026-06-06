import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SoftwareProvider } from './context/SoftwareContext'
import { ToastProvider } from './context/ToastContext'
import { LogProvider } from './context/LogContext'
import { WorkspaceDataProvider } from './context/WorkspaceDataContext'
import { InboxNotifyProvider } from './context/InboxNotifyContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <SoftwareProvider>
          <ToastProvider>
            <LogProvider>
              <WorkspaceDataProvider>
                <InboxNotifyProvider>
                  <App />
                </InboxNotifyProvider>
              </WorkspaceDataProvider>
            </LogProvider>
          </ToastProvider>
        </SoftwareProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
)
