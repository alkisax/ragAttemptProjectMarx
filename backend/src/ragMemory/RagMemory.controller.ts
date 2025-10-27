// backend\src\ragMemory\RagMemory.controller.ts
/*
  12. 
  we will add to the prompt the last 3 user inputs and a small summary of the answers and 4th one will be added to a summary i guess this is mainly fronend job to have a state with query A - summary of answear A query B - summary of answear B query C - summary of answear C query D - summary of answer D past discussions that when a new Query is askea this takes the position of A, A →B, B→C, C→D, D+past discussions = new past discussions so in the backend we now work i guess we need just space for the 3 past queries (B,C,D) + space for past sicussions summary and i guess we need a summariser endpoint that catches 2 things, past discussions and query d - summary of answer D

  prev → backend\src\rag\gptRagParagraph.routes.ts
  next → backend/src/ragMemory/RagMemory.routes.ts
*/

import type { Request, Response } from 'express'
import { handleControllerError } from '../utils/error/errorHandler';
import dotenv from 'dotenv'
import { getGPTResponse } from '../rag/gptRag.service'

dotenv.config()

// in → answer: string, out → summary of answer: string
const summarizeAnswer = async (req: Request, res: Response) => {
  try {
    const { answer } = req.body
    if (!answer) return res.status(400).json({ status: false, message: 'Missing answer text' })

    const apiKey = process.env.OPENAI_API_KEY!
    const prompt = `
      Summarize the following scholarly answer from Marx's *Capital* in one or two sentences.
      Keep it objective and concise.

      Answer:
      ${answer}
    `
    const summary = await getGPTResponse(prompt, apiKey)
    return res.json({ status: true, summary: summary.trim() })

  } catch (error) {
    return handleControllerError(res, error);
  }
}

// in → prev summary: string, η τεταρτη παλιά ερώτηση: string, και η περίληψη της απάντησής της: strig, out → μια νέα περίληψη: string 
export const updateDiscussionSummary = async (req: Request, res: Response) => {
  try {
    const { pastSummary, lastQuery, lastAnswerSummary } = req.body

    if (!lastQuery || !lastAnswerSummary) {
      return res.status(400).json({
        status: false,
        message: 'Missing lastQuery or lastAnswerSummary'
      })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ status: false, message: 'OPENAI_API_KEY not set' })
    }

    // 🧠 Prompt: συνδύασε την μέχρι τώρα περίληψη με την ερώτηση D και την περίληψη της απάντησης D
    // Στόχος: 1–2 προτάσεις, < ~100 tokens, χωρίς νέες πληροφορίες.
    const prompt = `
You are maintaining a concise rolling summary of a scholarly dialogue about Marx's *Das Kapital*.
Update the cumulative summary by incorporating ONLY the information provided.

Constraints:
- Output ONE short paragraph (1–2 sentences), objective, ≤ ~100 tokens.
- Do not introduce any facts beyond the provided snippets.
- Prefer stable terminology from Marx when present.

Previous cumulative summary (may be empty):
${pastSummary || '(none)'}

Last user query (D):
${lastQuery}

Summary of assistant answer (D):
${lastAnswerSummary}

Return only the updated cumulative summary (no preface, no list):`.trim()

    const merged = await getGPTResponse(prompt, apiKey)
    const summary = (merged || '').trim()

    return res.json({ status: true, summary })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ status: false, message: msg })
  }
}

export const gptRagMemoryController = {
  summarizeAnswer,
  updateDiscussionSummary
}
