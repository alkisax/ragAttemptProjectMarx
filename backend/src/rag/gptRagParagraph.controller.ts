// backend\src\rag\gptRagParagraph.controller.ts
/*
  10.
  💥 Δημιουργεί το prompt με βάση το context (semantic search) και καλεί τη σύνδεση με το OpenAI.

  prev → backend\src\rag\gptRag.service.ts
  next → backend\src\rag\gptRagParagraph.routes.ts (και μετά frontend)
*/

import type { Request, Response } from 'express'
import dotenv from 'dotenv'
import { gptEmbeddingsService } from '../vectorize/gptEmbeddingsParagraph.service'
import { getGPTResponse } from './gptRag.service'
import { ParagraphType } from '../types/paragraph.types'
import axios from 'axios'

dotenv.config() // μπορεί να αφαιρεθεί, αλλά δεν πειράζει αν μείνει — δεν είναι standalone

// -------------------------------------------------------------
// POST /api/rag/ask
// -------------------------------------------------------------
// αυτή εδώ απο λάθος στον σχεδιασμό δεν κάλεί την searchHandler της backend\src\vectorize\gptEmbeddingsParagraph.controller.ts και εφαρμόζει απο την αρχή ολη την λογική της. δεν πειράζει και θα το αφήσω. αλλα στην παρακάτω θα διορθωθεί
const askWithContext = async (req: Request, res: Response) => {
  try {
    // η ερώτηση string από το frontend
    // και προαιρετικά ένα μικρό ιστορικό των τελευταίων 4 ερωτοαπαντήσεων
    const { query, history } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query text' })
    }

    // διαμόρφωση ιστορικού (λίγη “μνήμη” για το chat)
    const chatHistory = Array.isArray(history)
      ? history
          .map((h: { role: string; content: string }) =>
            `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
          )
          .join('\n')
      : ''

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ status: false, message: 'OPENAI_API_KEY not set' })
    }

    // 1️⃣ semantic search — βρίσκουμε τις 5 πιο κοντινές παραγράφους
    // αυτή είναι η παλιά "χειροκίνητη" μεθοδος που ήταν πολύ αργή και την αντικαταστήσαμε με την semanticSearchParagraphsVector
    // const topParagraphs = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)

    let topParagraphs: ParagraphType[] = []
    try {
      console.log('using mongo vector search');
      // fast Mongo vector search
      topParagraphs = await gptEmbeddingsService.semanticSearchParagraphsVector(query, 5)
    } catch (err) {
      // old search
      console.error('❌ Vector search failed:', JSON.stringify(err, null, 2))
      console.warn('⚠️ Vector search unavailable, falling back to JS cosine search')
      topParagraphs = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)
    }


    // 2️⃣ δημιουργία context string
    const context = topParagraphs
      .map(
        (p: { paragraphNumber?: number | string | null; text?: string | null }, i: number) =>
          `Excerpt ${i + 1} (Paragraph ${p.paragraphNumber ?? '?'}):\n${p.text?.trim() ?? ''}`
      )
      .join('\n\n')

    // 3️⃣ σύνθεση του πλήρους prompt (σύμφωνα με τη λογική RAG)
    const prompt = `
      You are a scholarly assistant specializing in Karl Marx’s *Das Kapital*.
      
      Recent conversation:
      ${chatHistory || '(no previous context)'}

      Use the following excerpts from *Capital* as factual context to answer the user's question.
      Stay faithful to Marx’s terminology and reasoning.
      Do not invent new ideas — base your response strictly on the provided text.

      Context:
      ${context}

      Question:
      ${query}

      Answer:
    `.trim()

    // 4️⃣ καλούμε το OpenAI API
    const gptAnswer = await getGPTResponse(prompt, apiKey)

    // 5️⃣ επιστρέφουμε JSON απάντηση
    // 5️⃣ επιστρέφουμε JSON απάντηση χωρίς τα vectors
    return res.json({
      status: true,
      question: query,
      answer: gptAnswer,
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
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ status: false, message: msg })
  }
}

// -------------------------------------------------------------
// POST /api/rag/ask-extended
// -------------------------------------------------------------
const askWithContextExtended = async (req: Request, res: Response) => {
  try {
    const { query, history } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query text' })
    }

    // διαμόρφωση ιστορικού
    const chatHistory = Array.isArray(history)
      ? history.map((h: { role: string; content: string }) =>
          `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
        ).join('\n')
      : ''

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ status: false, message: 'OPENAI_API_KEY not set' })
    }

    console.log('🧩 Fetching extended semantic context (±3 paragraphs)...')

    // 🔹 1️⃣ Internal HTTP call στο /api/vectorise/search-extended
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await axios.post(`${backendUrl}/api/vectorise/search-some-extended`, { query })

    // παίρνουμε μόνο το data array
    const extendedResults = response.data.data

    // απο εδώ και περα είναι ίδα με την απο πάνω αλλα δεν πειράζει
    if (!extendedResults || !Array.isArray(extendedResults)) {
      return res.status(500).json({ status: false, message: 'No extended context found' })
    }

    // 🔹 2️⃣ Φτιάχνουμε context string
    const context = extendedResults
      .map(
        (r: any, i: number) =>
          `Excerpt ${i + 1} (Paragraph ${r.paragraphNumber ?? '?'}):\n${r.mergedText ?? ''}`
      )
      .join('\n\n')

    // 🔹 3️⃣ Prompt
    const prompt = `
      You are a scholarly assistant specializing in Karl Marx’s *Das Kapital*.

      Recent conversation:
      ${chatHistory || '(no previous context)'}

      Use the following extended excerpts (each ±3 paragraphs) as factual context.
      Stay faithful to Marx’s terminology and reasoning.
      Avoid speculation; rely only on the given context.

      Context:
      ${context}

      Question:
      ${query}

      Answer:
    `.trim()

    console.log('🧠 Sending RAG prompt to OpenAI...')

    // 🔹 4️⃣ GPT answer
    const gptAnswer = await getGPTResponse(prompt, apiKey)

    // 🔹 5️⃣ Return
    return res.json({
      status: true,
      question: query,
      answer: gptAnswer,
      context: extendedResults
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ status: false, message: msg })
  }
}

// -------------------------------------------------------------
// export
// -------------------------------------------------------------
export const gptRagParagraphController = {
  askWithContext,
  askWithContextExtended
}
