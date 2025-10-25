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

dotenv.config() // μπορεί να αφαιρεθεί, αλλά δεν πειράζει αν μείνει — δεν είναι standalone

// -------------------------------------------------------------
// POST /api/rag/ask
// -------------------------------------------------------------
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
    const topParagraphs = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)

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
    return res.json({
      status: true,
      question: query,
      answer: gptAnswer,
      context: topParagraphs
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
  askWithContext
}
