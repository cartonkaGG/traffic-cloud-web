import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { SoftwareId, SoftwareProduct } from '@/domain/softwareProducts'
import { getSoftwareProduct } from '@/domain/softwareProducts'
import {
  clearSelectedSoftware,
  getSelectedSoftware,
  setSelectedSoftware as persistSelectedSoftware
} from '@/lib/softwareSession'
import { useAuth } from './AuthContext'

const LAUNCH_MS = 680

type SoftwareContextValue = {
  selectedSoftwareId: SoftwareId | null
  selectedSoftware: SoftwareProduct | null
  launchingProduct: SoftwareProduct | null
  selectSoftware: (id: SoftwareId) => void
  launchSoftware: (id: SoftwareId, onNavigate?: () => void) => void
  clearSoftware: () => void
}

const SoftwareContext = createContext<SoftwareContextValue | null>(null)

export function SoftwareProvider({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated } = useAuth()
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<SoftwareId | null>(() =>
    getSelectedSoftware()
  )
  const [launchingProduct, setLaunchingProduct] = useState<SoftwareProduct | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      clearSelectedSoftware()
      setSelectedSoftwareId(null)
      setLaunchingProduct(null)
    }
  }, [isAuthenticated])

  const selectSoftware = useCallback((id: SoftwareId) => {
    persistSelectedSoftware(id)
    setSelectedSoftwareId(id)
  }, [])

  const launchSoftware = useCallback((id: SoftwareId, onNavigate?: () => void) => {
    const product = getSoftwareProduct(id)
    if (!product) return
    persistSelectedSoftware(id)
    setSelectedSoftwareId(id)
    setLaunchingProduct(product)
    window.setTimeout(() => {
      onNavigate?.()
      window.setTimeout(() => setLaunchingProduct(null), 420)
    }, LAUNCH_MS)
  }, [])

  const clearSoftware = useCallback(() => {
    clearSelectedSoftware()
    setSelectedSoftwareId(null)
    setLaunchingProduct(null)
  }, [])

  const value = useMemo(
    () => ({
      selectedSoftwareId,
      selectedSoftware: selectedSoftwareId ? getSoftwareProduct(selectedSoftwareId) ?? null : null,
      launchingProduct,
      selectSoftware,
      launchSoftware,
      clearSoftware
    }),
    [selectedSoftwareId, launchingProduct, selectSoftware, launchSoftware, clearSoftware]
  )

  return <SoftwareContext.Provider value={value}>{children}</SoftwareContext.Provider>
}

export function useSoftware(): SoftwareContextValue {
  const ctx = useContext(SoftwareContext)
  if (!ctx) throw new Error('useSoftware must be used within SoftwareProvider')
  return ctx
}
