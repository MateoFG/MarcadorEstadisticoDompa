import * as React from "react"
import { createContext, useContext, useState } from "react"

export type ViewMode = "mobile" | "tablet" | "desktop"

type ViewModeProviderProps = {
  children: React.ReactNode
  defaultViewMode?: ViewMode
  storageKey?: string
}

type ViewModeProviderState = {
  viewMode: ViewMode
  setViewMode: (viewMode: ViewMode) => void
}

const initialState: ViewModeProviderState = {
  viewMode: "desktop",
  setViewMode: () => null,
}

const ViewModeProviderContext = createContext<ViewModeProviderState>(initialState)

export function ViewModeProvider({
  children,
  defaultViewMode = "desktop",
  storageKey = "voleyball-view-mode",
  ...props
}: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem(storageKey) as ViewMode | null) || defaultViewMode
  })

  const value = {
    viewMode,
    setViewMode: (newViewMode: ViewMode) => {
      localStorage.setItem(storageKey, newViewMode)
      setViewMode(newViewMode)
    },
  }

  return (
    <ViewModeProviderContext.Provider {...props} value={value}>
      {children}
    </ViewModeProviderContext.Provider>
  )
}

export const useViewMode = () => {
  const context = useContext(ViewModeProviderContext)
  if (context === undefined)
    throw new Error("useViewMode must be used within a ViewModeProvider")
  return context
}
