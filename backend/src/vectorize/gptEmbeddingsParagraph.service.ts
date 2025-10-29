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

// 💣💣 14 💥💥αυτό προστέθηκε μετά το βήμα 13 ο σκοπός είναι να φτιαχτεί index με βάση το κείμενο ωστε να κάνουμε hybrid search με semantic και με BM25 (text-based)
// next → backend\src\vectorize\gptEmbeddingsParagraph.controller.ts
// -------------------------------------------------------------
// 💥 Μικτή Αναζήτηση (Hybrid BM25 + Vector Similarity)
// -------------------------------------------------------------
/*
  in → query: text, topN: number
  out → N paragraphs
*/
const hybridSearchParagraphs = async (query: string, topN = 5) => {

  // 1. Semantic search (vector similarity) Κάνει το query vector και βρήσκει τις top N με semantic
  const vectorResults = await gptEmbeddingsService.semanticSearchParagraphsVector(query, topN * 2)

  // 2. BM25 full-text search
  // Η Mongo έχει ένα built-in “text search” (BM25) για να βρίσκει λέξεις μέσα σε κείμενα.
  // “Βρες μου όλα τα Paragraphs που περιέχουν τις λέξεις του query
  const bm25Results = await Paragraph.find({ $text: { $search: query } })
    // “Όταν μου φέρεις τα documents, θέλω να επιστρέψεις ΜΟΝΟ δύο πεδία: text → το ίδιο το κείμενο της παραγράφου, score → το text relevance score (υπολογισμένο από τον αλγόριθμο BM25)
    // $meta: 'textScore → “βάλε ένα επιπλέον πεδίο score με τη σχετικότητα αυτού του document ως προς το query.”
    .select({ text: 1, score: { $meta: 'textScore' } })
    // Ταξινόμησε τα αποτελέσματα από το πιο σχετικό προς το λιγότερο
    .sort({ score: { $meta: 'textScore' } })
    .limit(topN * 2)
    // Επιστρέψε απλά JavaScript objects αντί για Mongoose documents.
    .lean()

  // 3. Ομαδοποίηση ανά document
  // Δημιουργούμε ένα Dictionary που κρατά:
  // key: το id του paragraph (string)
  // value: ένα object { cosine, bm25, text }
  const scoreMap = new Map<string, { cosine: number; bm25: number; text: string }>()

  // παίρνουμε τα αποτελέσματα απο το semantic search και για κάθε ένα απο αυτά του λέμε οτι η τιμή του score του είναι αυτή που βγήκε απο το cosine score και 0 όσων αφορα το bm25 (θα προστεθεί αργότερα) + αποθηκευουμε το κείμενο της παραγράφου
  // → “Γέμισε το Map με όλα τα αποτελέσματα του semantic/vector search.Για κάθε _id κράτα το cosine score.”
  // .set() στο Map(Dictionary/Hashmap) ≈ .push() σε ένα Array
  for (const v of vectorResults) {
    scoreMap.set(String(v._id), { 
      cosine: v.score ?? 0,
      bm25: 0,
      text: v.text ?? ''
    })
  }

  // Παίρνουμε τα αποτελέσματα απο bm25
  for (const b of bm25Results) {
    // “Ψάξε μέσα στο Map αν υπάρχει ήδη εγγραφή για αυτό το _id.”
    const existing = scoreMap.get(String(b._id))
    // αν το έχουμε συναντήσει και στο semantic του προσθέτουμε και το bm25 score που πριν το είχαμε 0
    if (existing) existing.bm25 = b.score ?? 0
    // αλλιως του ενημερώνουμε το bm25 score, κρατάμε το κείμενο και βάζουμε το score του semantic, 0
    else scoreMap.set(String(b._id), {
      cosine: 0,
      bm25: b.score ?? 0,
      text: b.text ?? ''
    })
  }

  // 4. Κανονικοποίηση (normalize) scores [0–1]
  // πρέπει να φέρεις διαφορετικές τιμές στην ίδια κλίμακα (0–1), ώστε να μπορείς να τις συνδυάσεις
  // δύο διαφορετικά είδη score:
  // cosine → semantic ομοιότητα (π.χ. 0.81, 0.56, 0.12 κ.λπ.)
  // bm25 → text-based relevance (π.χ. 5.2, 3.1, 0.7 κ.λπ.)

  /*  --Αυτό είναι το λεγόμενο min-max normalization:-- 
  οπότε αναζητώ το μεγιστο της καθε μιας για να διερέσω το score με το μέγιστο. Όμως δεν μπορω να ξέρω πιο είναι το μεγιστο αλλα μόνο το μεγαλύτερο βαθμό που βρήκα. 
  “Το άριστα για cosine είναι 1.0, γιατί αυτό σημαίνει απόλυτη ταύτιση.”
  “Το άριστα για BM25 είναι ??, αλλά δεν είναι σταθερό, αλλάζει με το query.” Για BM25, δεν υπάρχει σταθερό “άριστα”, γιατί εξαρτάται από το μήκος του εγγράφου, τη συχνότητα λέξεων, το query, κλπ. Μπορεί να είναι 3, 10 ή 120.
  Το **μέγιστο υπαρκτό** είναι ένας πρακτικός, δυναμικός τρόπος να φέρεις όλες τις τιμές στο ίδιο εύρος, ανεξαρτήτως μονάδων ή θεωρητικού άριστα. Ουσιαστικά λες:“Ποια παράγραφος είχε τη μεγαλύτερη ομοιότητα στο τρέχον query; Αυτή θα θεωρηθεί 100%. Όλες οι άλλες θα μετρηθούν σε σχέση με αυτή.

  Αν πχ αν τα semantic scores είναι [0.9, 0.45, 0.3] Άρα το “καλύτερο” που υπήρξε → γίνεται το 1.0, και όλα τα υπόλοιπα εκφράζονται σχετικά ως ποσοστό του καλύτερου.

  Με αυτόν τον τρόπο φέρνουμε τις δύο μετρικές (semantic και BM25) 
  στην ίδια κλίμακα [0–1] ώστε να μπορούν να συνδυαστούν δίκαια
  */
  // φτιάχνει ένα arr μονο με τα σκορ απο vector
  const cosVals = Array.from(scoreMap.values()).map(v => v.cosine)
  // φτιάχνει ένα arr μονο με τα σκορ απο bm25
  const bmVals = Array.from(scoreMap.values()).map(v => v.bm25)
  // Βρίσκει το μεγαλύτερο (μέγιστο) σε κάθε λίστα
  // Το , 1 στο τέλος για να μην βγει Infinity
  const cosMax = Math.max(...cosVals, 1)
  const bmMax = Math.max(...bmVals, 1)

  // 5. Συνδυασμός
  // id → είναι το _id της παραγράφου (string)
  // obj → είναι το αντικείμενο { cosine, bm25, text }
  const combined = await Promise.all(
    Array.from(scoreMap.entries()).map(async ([id, obj]) => {
      // Φέρνουμε επιπλέον μεταδεδομένα για κάθε παράγραφο (book, chapter κλπ)
      const paragraph = await Paragraph.findById(id)
        .select('book chapter paragraphNumber chapterTitle sectionTitle subsectionTitle subsubsectionTitle text')
        .lean()

      return {
        _id: id,
        book: paragraph?.book ?? null,
        chapter: paragraph?.chapter ?? null,
        paragraphNumber: paragraph?.paragraphNumber ?? null,
        chapterTitle: paragraph?.chapterTitle ?? null,
        sectionTitle: paragraph?.sectionTitle ?? null,
        subsectionTitle: paragraph?.subsectionTitle ?? null,
        subsubsectionTitle: paragraph?.subsubsectionTitle ?? null,
        text: obj.text,
        cosine: obj.cosine,
        bm25: obj.bm25,
        // finalScore: 0.7 * (obj.cosine / cosMax) + 0.3 * (obj.bm25 / bmMax) // ⚠️⚠️⚠️⚠️ 70% vector / 30% bm25
        finalScore: 0.5 * (obj.cosine / cosMax) + 0.5 * (obj.bm25 / bmMax) // ⚠️⚠️⚠️⚠️ 50% vector / 50% bm25
      }
    })
  )

  // 6. Ταξινόμηση κατά finalScore
  combined.sort((a, b) => b.finalScore - a.finalScore)

  // 7. Επιστρέφουμε τα topN
  return combined.slice(0, topN)
}

export const gptEmbeddingsService = {
  getEmbedding,
  cosineSimilarity,
  semanticSearchParagraphs,
  semanticSearchParagraphsVector,
  hybridSearchParagraphs
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

/* --- οδηγίες για δημιουργεία text index ---
  απλώς προσθέτω την γραμμή 
  paragraphSchema.index({ text: 'text' })
  στο μοντέλο
*/