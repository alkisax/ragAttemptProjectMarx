// frontend/src/hooks/useRagMemory.ts
import { useState } from 'react'
import axios from 'axios'
import { useVariables } from '../context/VariablesContext'

export interface MemoryEntry {
  query: string
  summary: string
}

export interface RagMemoryState {
  entries: MemoryEntry[]     // up to 3 last Q/A summaries
  pastSummary: string        // cumulative summary from backend
}

export const useRagMemory = () => {
  const { backendUrl } = useVariables()
  const [memory, setMemory] = useState<RagMemoryState>({
    entries: [],
    pastSummary: ''
  })

  // 1️⃣ Summarize a full answer
  const summarizeAnswer = async (answer: string): Promise<string> => {
    console.log('🧩 [summarizeAnswer] Sending to summarizer:', answer.slice(0, 120) + '...')
    try {
      const res = await axios.post(`${backendUrl}/api/rag-memory/summarize-answer`, { answer })
      console.log('✅ [summarizeAnswer] Summary received:', res.data.summary)
      return res.data.summary || ''
    } catch (err) {
      console.error('❌ Error summarizing answer:', err)
      return ''
    }
  }

  // 2️⃣ Update cumulative discussion summary
  const updateDiscussionSummary = async (
    lastQuery: string,
    lastAnswerSummary: string
  ): Promise<string> => {
    console.log('🧩 [updateDiscussionSummary] Sending:', {
      pastSummary: memory.pastSummary,
      lastQuery,
      lastAnswerSummary
    })    
    try {
      const res = await axios.post(`${backendUrl}/api/rag-memory/update-summary`, {
        pastSummary: memory.pastSummary,
        lastQuery,
        lastAnswerSummary
      })
      console.log('✅ [updateDiscussionSummary] Updated summary received:', res.data.summary)
      return res.data.summary || ''
    } catch (err) {
      console.error('❌ Error updating summary:', err)
      return memory.pastSummary
    }
  }

  // 3️⃣ Core pipeline: update local memory after each new answer
  const handleNewAnswer = async (query: string, fullAnswer: string) => {
    console.log('⚙️ [handleNewAnswer] New query:', query)
    // summarize new answer
    const summary = await summarizeAnswer(fullAnswer)

    // shift memory: keep last 2, add new one at end
    const updatedEntries = [...memory.entries.slice(-2), { query, summary }]
    console.log('🧱 [handleNewAnswer] Updated entries:', updatedEntries)

    // if we already have 3 previous entries → update cumulative summary
    let newPastSummary = memory.pastSummary
    if (updatedEntries.length === 3) {
      console.log('🧠 [handleNewAnswer] Triggering cumulative summary update (3 entries)')
      const lastEntry = updatedEntries[2]
      newPastSummary = await updateDiscussionSummary(
        lastEntry.query,
        lastEntry.summary
      )
    } else {
      console.log('ℹ️ [handleNewAnswer] Not enough entries yet for cumulative summary (need 3)')
    }

    setMemory({
      entries: updatedEntries,
      pastSummary: newPastSummary
    })
    
    console.log('📦 [handleNewAnswer] New memory state:', {
      entries: updatedEntries,
      pastSummary: newPastSummary
    })

    return newPastSummary
  }

  // expose both the memory and control functions
  return {
    memory,
    summarizeAnswer,
    updateDiscussionSummary,
    handleNewAnswer
  }
}
