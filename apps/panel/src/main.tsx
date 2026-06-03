import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LogProvider } from './context/LogContext'
import { WorkspaceDataProvider } from './context/WorkspaceDataContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <LogProvider>
            <WorkspaceDataProvider>
              <App />
            </WorkspaceDataProvider>
          </LogProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
)
