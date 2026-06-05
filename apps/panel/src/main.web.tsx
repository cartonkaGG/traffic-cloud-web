import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SoftwareProvider } from './context/SoftwareContext'
import { ToastProvider } from './context/ToastContext'
import { LogProvider } from './context/LogContext'
import { WorkspaceDataProvider } from './context/WorkspaceDataContext'
import './styles/globals.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <SoftwareProvider>
          <ToastProvider>
            <LogProvider>
              <WorkspaceDataProvider>
                <App />
              </WorkspaceDataProvider>
            </LogProvider>
          </ToastProvider>
        </SoftwareProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
