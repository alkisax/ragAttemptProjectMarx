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
  🔍 Semantic search (χειροκίνητη μέθοδος)
  input: query string (πχ "labour theory of value")
  output: top N πιο σχετικά paragraphs
*/
export interface ParagraphWithScore extends ParagraphType {
  score: number
}

// 💥🐌 τελικά δεν θα χρησιμοποιηθεί αυτή η συνάρτηση
const semanticSearchParagraphs = async (query: string, topN = 5): Promise<ParagraphWithScore[]> => {
  const queryVector = await getEmbedding(query)

  // φέρνουμε μόνο όσα έχουν vector
  // ⚠️ 1. Εδώ είναι το κύριο bottleneck
  // Φέρνουμε από τη Mongo ΟΛΑ τα documents που έχουν vector[].
  // Δηλαδή ~8.000 παραγράφους, καθεμία με έναν πίνακα 1.536 αριθμών.
  // Αυτό σημαίνει:
  //   - Η MongoDB πρέπει να διαβάσει όλους αυτούς τους τεράστιους πίνακες
  //   - Να τους στείλει μέσω δικτύου στο Node.js
  //   - Το Node.js πρέπει να κρατήσει χιλιάδες μεγάλα arrays στη μνήμη
  //   Αυτό κάνει το query να κρατάει δεκάδες δευτερόλεπτα.
  const paragraphs = await Paragraph.find(
    {
      vector: 
        { $exists: true,
          $ne: [] // not equal
        },
      type: 'text'
    },
    { book:1, chapter: 1, chapterTitle: 1, sectionTitle: 1, subsectionTitle: 1, subsubsectionTitle: 1, paragraphNumber: 1, text: 1, vector: 1 }
  ).lean<ParagraphType[]>()

  // ⚠️ 3️⃣ Εδώ υπολογίζουμε cosine similarity για κάθε παράγραφο στη JavaScript.
  // Δηλαδή 8.000 × 1.536 = 12 εκατομμύρια πολλαπλασιασμοί / αθροίσεις.
  // Η Node δεν είναι φτιαγμένη για τόσο βαριά αριθμητική επεξεργασία,
  // με αποτέλεσμα μεγάλη καθυστέρηση.
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
      // ⚠️ Η cosineSimilarity τρέχει χιλιάδες φορές εδώ!
      score: cosineSimilarity(queryVector, p.vector!)
    }))
    // κάνουμε sort και παίρνουμε τα 5 κορυφαία αποτελέσματα
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  return ranked
}

// 🧠🐇 Αυτή η συνάρτηση χρησιμοποιεί τα build in εργαλεία για vector search της mongoDB, είναι πιο γρήγορη γιατι το cosine similarity  γίνετε στο επίπεδο της DB και οχι εδώ (και άρα και η cosineSimilarity που έχω εδώ ειναι ξεπερασμένη) και θα χρησιμοποιηθεί αυτή.
// input: query string (πχ "labour theory of value")
// output: top N πιο σχετικά paragraphs
export const semanticSearchParagraphsVector = async (query: string, topN = 5): Promise<ParagraphType[]> => {
  // κάνουμε vector το query μεσο openAi api (όπως πριν)
  const queryVector = await getEmbedding(query)

  // στο mongo model μας τρέχουμε την aggragate. H μέθοδος .aggregate() τρέχει ένα aggregation pipeline, δηλαδή μια ακολουθία “σταδίων” (stages) που εφαρμόζονται το ένα μετά το άλλο στα δεδομένα
  const results = await Paragraph.aggregate([
    // Το $vectorSearch είναι μια νέα εντολή της MongoDB (από την έκδοση 7 και μετά) που επιτρέπει να κάνεις αναζήτηση ομοιότητας (semantic search) απευθείας μέσα στη βάση, χωρίς να χρειάζεται να φέρεις όλα τα έγγραφα στη Node και να υπολογίσεις cosine similarity με JavaScript.Η Mongo χρησιμοποιεί τον δείκτη (vector index) που έφτιαξες για το πεδίο vector και συγκρίνει εσωτερικά (σε C++) το διάνυσμα της ερώτησής σου με τα αποθηκευμένα vectors. Έτσι παίρνεις σχεδόν ακαριαία τα πιο κοντινά αποτελέσματα.
    {
      $vectorSearch: {
        index: 'vector_index',       // same name as in Compass
        path: 'vector',              // 💣 σε πιο field γίνετε η αναζήτηση
        queryVector: queryVector,    // το vector της ερώτησης
        numCandidates: 100,          // you can experiment with 50–200
        limit: topN                  // πόσα θα επιστραφούν
      }
    },
    // Η επόμεντη συνάρτηση στο aggragate: After $vectorSearch finds the matches, $project decides what fields to include in the final result.
    {
      $project: {
        // vector: 0,                   // don’t return the heavy array
        score: { $meta: 'vectorSearchScore' },
        book: 1,
        chapter: 1,
        chapterTitle: 1,
        sectionTitle: 1,
        subsectionTitle: 1,
        subsubsectionTitle: 1,
        paragraphNumber: 1,
        text: 1
      }
    }
  ])

  return results as ParagraphType[]
}

export const gptEmbeddingsService = {
  getEmbedding,
  cosineSimilarity,
  semanticSearchParagraphs,
  semanticSearchParagraphsVector
}

/* --- οδηγίες για δημιουργεία vector index στο mongo compass ---
  🗂 Open your collection
  In the left sidebar, expand your database name (for example ragAttemptProjectMarx or test).
  Click on the collection paragraphs.
  You’ll see the list of documents — each should have fields like
  book, chapter, text, and the long vector: [ … ] array.

  ⚙️ Go to the “Indexes” tab
  At the top bar (right under the collection name) you’ll see tabs:
  Documents | Aggregations | Schema | Indexes | Validation
  Click Indexes.

  ➕ Create the Vector Index
  Click “Create Index.”
  If Compass shows a “Vector Index” option → choose it.
  If not, choose “Atlas Search Index” (it’s the same engine).
  A text box or JSON editor will appear — paste this JSON exactly:
  {
    "fields": [
      {
        "type": "vector",
        "path": "vector",
        "numDimensions": 1536,
        "similarity": "cosine"
      }
    ]
  }

  In the Index Name field, type:
  vector_index
  Click Create Index.
  Compass will show “Building index…” — it usually takes 1–2 minutes.
*/