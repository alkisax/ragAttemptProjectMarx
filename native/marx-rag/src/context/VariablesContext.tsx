// native\marx-rag\src\context\VariablesContext.tsx
/*
  3.
*/

import { createContext, useContext } from 'react'

export interface VariablesContextType {
  backendUrl: string
}

export const VariablesContext = createContext<VariablesContextType>({
  backendUrl: '',
})

export const VariablesProvider = ({ children }: { children: React.ReactNode }) => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001'

  return (
    <VariablesContext.Provider value={{ backendUrl }}>
      {children}
    </VariablesContext.Provider>
  )
}

export const useVariables = (): VariablesContextType => useContext(VariablesContext)
