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

type SoftwareContextValue = {
  selectedSoftwareId: SoftwareId | null
  selectedSoftware: SoftwareProduct | null
  selectSoftware: (id: SoftwareId) => void
  clearSoftware: () => void
}

const SoftwareContext = createContext<SoftwareContextValue | null>(null)

export function SoftwareProvider({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated } = useAuth()
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<SoftwareId | null>(() =>
    getSelectedSoftware()
  )

  useEffect(() => {
    if (!isAuthenticated) {
      clearSelectedSoftware()
      setSelectedSoftwareId(null)
    }
  }, [isAuthenticated])

  const selectSoftware = useCallback((id: SoftwareId) => {
    persistSelectedSoftware(id)
    setSelectedSoftwareId(id)
  }, [])

  const clearSoftware = useCallback(() => {
    clearSelectedSoftware()
    setSelectedSoftwareId(null)
  }, [])

  const value = useMemo(
    () => ({
      selectedSoftwareId,
      selectedSoftware: selectedSoftwareId ? getSoftwareProduct(selectedSoftwareId) ?? null : null,
      selectSoftware,
      clearSoftware
    }),
    [selectedSoftwareId, selectSoftware, clearSoftware]
  )

  return <SoftwareContext.Provider value={value}>{children}</SoftwareContext.Provider>
}

export function useSoftware(): SoftwareContextValue {
  const ctx = useContext(SoftwareContext)
  if (!ctx) throw new Error('useSoftware must be used within SoftwareProvider')
  return ctx
}
