// backend\src\rag\gptRag.service.ts
/*
  9.
  💥 RAG Service — Κεντρική σύνδεση με το GPT API

  prev → backend\src\vectorize\gptEmbeddingsParagraph.routes.ts
  next → backend\src\rag\gptRagParagraph.controller.ts
*/

import axios from 'axios'
/*
-------------------------------------------------------------
🧠 getGPTResponse
input: string | output: string
-------------------------------------------------------------
Αυτή εδώ είναι η κεντρική σύνδεση για τον GPT wrapper.
Κάνουμε ένα POST request (url,parameters,auth) προς το API του OpenAI όπου μέσα στα parameters βρίσκεται το prompt μου.
Το prompt (στην περίπτωσή μας περιλαμβάνει και το context που έχει
προκύψει από τη semantic / cosine similarity search) το φτιάχνουμε
στο επόμενο στάδιο.
-------------------------------------------------------------
*/

export const getGPTResponse = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  const url = 'https://api.openai.com/v1/chat/completions'

  try {
    console.log('🧠 using chat completions endpoint', prompt.slice(0, 120))

    const response = await axios.post(
      url,
      {
        // model: 'gpt-3.5-turbo', // ✅ εδώ μπορείς αργότερα να το αλλάξεις σε 'gpt-4-turbo'
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  } catch (err: unknown) {
    // Αν προκύψει σφάλμα, το αναγνωρίζουμε και το πετάμε με καθαρό μήνυμα.
    const msg = err instanceof Error ? err.message : 'Unknown GPT error'
    throw new Error(`Error fetching GPT response: ${msg}`)
  }
}

// Η μορφή του JSON response από το API είναι:
/*
  {
    "id": "chatcmpl-8XYZaBc123",
    "object": "chat.completion",
    "created": 1720000000,
    "model": "gpt-3.5-turbo",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "This is the AI's answer to your prompt."
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 14,
      "completion_tokens": 8,
      "total_tokens": 22
    },
    "system_fingerprint": "fp_abc123"
  }
*/

// Επιστρέφουμε μόνο το content του πρώτου choice,
// δηλαδή το πραγματικό κείμενο της απάντησης του GPT.