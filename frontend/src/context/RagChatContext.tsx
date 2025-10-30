/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useRagChat } from '../hooks/useRagChat'
import type { Message } from '../types/types'
import type { RagMemoryState } from '../hooks/useRagMemory'

interface RagChatContextType {
  messages: Message[]
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  loading: boolean
  handleAskExtendedHybrid: () => Promise<void>
  handleAskHybridBook1: () => Promise<void>
  memory: RagMemoryState 
}

const RagChatContext = createContext<RagChatContextType | null>(null)

export const RagChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { messages, query, setQuery, loading, handleAskExtendedHybrid, handleAskHybridBook1, memory } = useRagChat()

  return (
    <RagChatContext.Provider value={{ messages, query, setQuery, loading, handleAskExtendedHybrid, handleAskHybridBook1, memory }}>
      {children}
    </RagChatContext.Provider>
  )
}

export const useRagChatContext = () => {
  const ctx = useContext(RagChatContext)
  if (!ctx) throw new Error('useRagChatContext must be used within RagChatProvider')
  return ctx
}
