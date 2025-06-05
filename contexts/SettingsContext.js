import React, { createContext, useState } from 'react'

// 1. Create context
export const SettingsContext = createContext()

// 2. Provider component
export const SettingsProvider = ({ children }) => {
  // Tracks whether app is unlocked or still disguised
  const [isUnlocked, setIsUnlocked] = useState(false)

  // TTL setting for auto-wiping local media (journal only)
  const [autoWipeTTL, setAutoWipeTTL] = useState('24h') // Options: '24h', '48h', 'never'

  return (
    <SettingsContext.Provider
      value={{
        isUnlocked,
        setIsUnlocked,
        autoWipeTTL,
        setAutoWipeTTL,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}