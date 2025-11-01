// native\marx-rag\src\hooks\useRagChat.ts
/*
  6.
  Δεν έχει αλλάξει απο web
*/

import 'react-native-get-random-values'
import axios from 'axios'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ExtendedParagraph, Message, ParagraphBase, ParagraphContext, RagResponse } from '../types/types'
import { useVariables } from '../context/VariablesContext'
import { useRagMemory } from './useRagMemory'

export const useRagChat = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { backendUrl } = useVariables()
  const { memory, handleNewAnswer } = useRagMemory()

  const universalAskHandler = async (
    urlExtension: 'ask' | 'ask-extended' | 'ask-hybrid' | 'ask-extended-hybrid' | 'ask-hybrid-book1'
  ) => {
    if (!query.trim()) return

    const userMsg: Message = { id: uuidv4(), role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setQuery('')

    try {
      console.log('🚀 [universalAskHandler] Sending ask request:', {
        endpoint: `${backendUrl}/api/rag/${urlExtension}`,
        payload: {
          query,
          pastDiscussionSummary: memory.pastSummary
            ? memory.pastSummary.slice(0, 300) + (memory.pastSummary.length > 300 ? '…' : '')
            : '(none)'
        }
      })
      
      const res = await axios.post<RagResponse>(`${backendUrl}/api/rag/${urlExtension}`, {
        query,
        pastDiscussionSummary: memory.pastSummary
      })
      const { answer, context } = res.data

      // immediately summarize and update rolling memory
      const newSummary = await handleNewAnswer(query, answer)
      console.log('🧠 Updated cumulative summary:', newSummary)

      const normalized = normalizeContext(context, urlExtension) // δες παρακατω σχόλιο

      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: answer.trim(),
        context: normalized,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error('❌ Error sending extended query:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    universalAskHandler('ask')
  }

  const handleAskExtended = async () => {
    universalAskHandler('ask-extended')
  }

  const handleAskHybrid = async () => {
    universalAskHandler('ask-hybrid')
  }
  
  const handleAskExtendedHybrid = async () => {
    universalAskHandler('ask-extended-hybrid')
  }

  const handleAskHybridBook1 = async () => {
    universalAskHandler('ask-hybrid-book1')
  }

  // ένα πρόβλημα που έχουμε είναι πως η ask και η ask-extended επιστρέφουν ένα obj με διαφορετικά fields οπότε θα πρέπει να κάνουμε normalise το ένα στο άλλο (💣 ΥΓ στο τελος)
  const normalizeContext = (
    context:  (ParagraphBase | ExtendedParagraph)[],
    mode: 'ask' | 'ask-extended' | 'ask-hybrid' | 'ask-extended-hybrid' | 'ask-hybrid-book1'
  ): ParagraphContext[] => {

    if (!Array.isArray(context)) return []

    if (mode === 'ask' || mode === 'ask-hybrid' || mode === 'ask-hybrid-book1') {
      return context.map(p => ({
        paragraphNoTotal: (p as ParagraphBase).paragraphNumber ?? '?',
        text: (p as ParagraphBase).text ?? '',
        book: (p as ParagraphBase).book ?? undefined,
        chapter: (p as ParagraphBase).chapter ?? undefined,
        chapterTitle: (p as ParagraphBase).chapterTitle ?? undefined,
        sectionTitle: (p as ParagraphBase).sectionTitle ?? undefined,
        subsectionTitle: (p as ParagraphBase).subsectionTitle ?? undefined,
        subsubsectionTitle: (p as ParagraphBase).subsubsectionTitle ?? undefined,
        score: (p as ParagraphBase).score ?? undefined
      }))
    }

    if (mode === 'ask-extended' || mode === 'ask-extended-hybrid') {
      return context.map(p => ({
        paragraphNoTotal: (p as ExtendedParagraph).paragraphNumber ?? '?',
        text:
          (p as ExtendedParagraph).mergedText ||
          (p as ExtendedParagraph).centerParagraph?.text ||
          '',
        book: (p as ExtendedParagraph).book ?? undefined,
        chapter: (p as ExtendedParagraph).chapter ?? undefined,
        chapterTitle: (p as ExtendedParagraph).chapterTitle ?? undefined,
        sectionTitle: (p as ExtendedParagraph).sectionTitle ?? undefined,
        subsectionTitle: (p as ExtendedParagraph).subsectionTitle ?? undefined,
        subsubsectionTitle: (p as ExtendedParagraph).subsubsectionTitle ?? undefined,
        score:
          (p as ExtendedParagraph).score ??
          (p as ExtendedParagraph).centerParagraph?.score ??
          undefined
      }))
    }

    return [] // fallback for future modes
  }

  return { query, setQuery, messages, loading, handleAsk, handleAskExtended, handleAskHybrid,handleAskExtendedHybrid, handleAskHybridBook1, memory }
}


/*
  απλό ask:
  context: topParagraphs.map(p => ({
    _id: p._id,
    book: p.book,
    chapter: p.chapter,
    chapterTitle: p.chapterTitle,
    sectionTitle: p.sectionTitle,
    subsectionTitle: p.subsectionTitle,
    subsubsectionTitle: p.subsubsectionTitle,
    paragraphNumber: p.paragraphNumber,
    text: p.text,
    score: p.score
  }))

  askwith context: 
  expandedResults.push({
    book: match.book,
    chapter: match.chapter,
    chapterTitle: match.chapterTitle,
    sectionTitle: match.sectionTitle,
    subsectionTitle: match.subsectionTitle,
    subsubsectionTitle: match.subsubsectionTitle,
    paragraphNumber: match.paragraphNumber,
    centerParagraph: {
      _id: match._id,
      paragraphNumber: match.paragraphNumber,
      text: match.text ? match.text.split(/\s+/).slice(0, 5).join(' ') + '...' : '', score: match.score
    },
    mergedText
  })
*/
