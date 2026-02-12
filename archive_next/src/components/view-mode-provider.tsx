"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type ViewMode = "mobile" | "tablet" | "desktop"

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
  storageKey = "vite-ui-view-mode",
  ...props
}: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
      return defaultViewMode;
    }
    try {
      return (localStorage.getItem(storageKey) as ViewMode | null) || defaultViewMode
    } catch (e) {
      console.error("Failed to access localStorage, using default view mode.", e);
      return defaultViewMode;
    }
  })

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const storedViewMode = localStorage.getItem(storageKey) as ViewMode | null
        if (storedViewMode) {
          setViewMode(storedViewMode)
        }
      }
    } catch (e) {
      console.error("Failed to access localStorage on mount.", e);
    }
  }, [storageKey])

  const value = {
    viewMode,
    setViewMode: (newViewMode: ViewMode) => {
      try {
        if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
          localStorage.setItem(storageKey, newViewMode)
        }
      } catch (e) {
        console.error("Failed to set view mode in localStorage.", e);
      }
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
