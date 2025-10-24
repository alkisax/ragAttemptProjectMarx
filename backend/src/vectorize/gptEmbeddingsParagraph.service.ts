// backend\src\vectorize\gptEmbeddingsParagraph.service.ts

/*
  5.
  💥Η δουλειά του φακέλου vectorize είναι να προσθέσει vector στο field vector[] των mongo documents μέσο OpenAI.
  Εδώ έχουμε 4 βασικές συναρτήσεις:
    - getEmbedding: μετατρέπει ένα κείμενο σε διάνυσμα (vector[])
    - cosineSimilarity: ο μαθηματικός τύπος για την σύγκριση 2 διανυσμάτων
    - vectorizeAllParagraphs: δημιουργεί embeddings για όλα τα paragraphs type:"text"
    - semanticSearchParagraphs: θα χρησιμοποιηθεί αργότερα για semantic search στο front

  prev → backend\src\paragraphs\paragraphMongoFeeder.script.ts
  next → backend\src\vectorize\vectorizeParagraphs.script.ts
*/

import axios from 'axios'
import dotenv from 'dotenv'
import Paragraph from '../paragraph/paragraph.model'
import type { ParagraphType } from '../types/paragraph.types'

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string


/*
  εξήγηση του: return response.data.data[0].embedding

  Αν στείλεις:
  {
    "model": "text-embedding-3-small",
    "input": "Karl Marx Capital"
  }

  τότε το API απαντά κάπως έτσι:
  {
    "object": "list",
    "data": [
      {
        "object": "embedding",
        "index": 0,
        "embedding": [0.0123, -0.0456, 0.0789, ...] 
      }
    ],
    "model": "text-embedding-3-small"
  }

  Επομένως:
  - response.data = όλο το JSON αντικείμενο
  - response.data.data = ο πίνακας [ { … } ]
  - response.data.data[0].embedding = το πραγματικό vector (number[])
*/
const getEmbedding = async (text: string): Promise<number[]> => {
  const url = 'https://api.openai.com/v1/embeddings'
  const response = await axios.post(
    url,
    { model: 'text-embedding-3-small', input: text },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  return response.data.data[0].embedding
}

/*
  Ο κλασσικός μαθηματικός τύπος cosine similarity
  Υπολογίζει το "πόσο κοντά" είναι δύο διανύσματα (0–1 range)
  δεν έχει κάτι να καταλάβω. Απλός τον παίρνω
*/
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dot / (normA * normB)
}

/*
  🔍 Semantic search
  input: query string (πχ "labour theory of value")
  output: top N πιο σχετικά paragraphs
*/
export interface ParagraphWithScore extends ParagraphType {
  score: number
}

const semanticSearchParagraphs = async (query: string, topN = 5): Promise<ParagraphWithScore[]> => {
  const queryVector = await getEmbedding(query)

  // φέρνουμε μόνο όσα έχουν vector
  const paragraphs = await Paragraph.find(
    {
      vector: 
        { $exists: true,
          $ne: []
        },
      type: 'text'
    },
    { paragraphNumber: 1, text: 1, vector: 1, chapterTitle: 1, chapter: 1 }
  ).lean<ParagraphType[]>()

  const ranked = paragraphs
    .map(p => ({
      _id: p._id,
      book: p.book,
      chapter: p.chapter,
      chapterTitle: p.chapterTitle,
      sectionTitle: p.sectionTitle,
      subsectionTitle: p.subsectionTitle,
      subsubsectionTitle: p.subsubsectionTitle,
      type: p.type,
      paragraphNumber: p.paragraphNumber,
      text: p.text,
      hasFootnotes: p.hasFootnotes,
      vector: p.vector,
      score: cosineSimilarity(queryVector, p.vector!)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  return ranked
}

export const gptEmbeddingsService = {
  getEmbedding,
  cosineSimilarity,
  semanticSearchParagraphs
}