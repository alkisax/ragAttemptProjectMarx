//backend\src\vectorize\vectorizeParagraphs.script.ts

/*
  6.
  💥 Αυτό το script κάνει vectorize όλα τα Mongo documents που έχουν type:"text"
  και άδειο πεδίο vector[]. Δημιουργεί embeddings μέσω OpenAI API
  και τα αποθηκεύει πίσω στη MongoDB.

  ➤ Τρέχεται μία φορά ως standalone εργαλείο:
      npm run mongo:vectorize

  prev → backend\src\paragraphs\paragraphMongoFeeder.script.ts
  next → backend\src\vectorize\gptEmbeddingsParagraph.service.ts
*/

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import Paragraph from '../paragraph/paragraph.model'
import type { ParagraphType } from '../types/paragraph.types'
import { gptEmbeddingsService } from './gptEmbeddingsParagraph.service'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI as string
if (!MONGODB_URI) throw new Error('❌ Missing MONGODB_URI in .env')

// -------------------------------------------------------------
// βοηθητικές συναρτήσεις για progress file
// -------------------------------------------------------------
const progressFile = path.resolve(__dirname, 'vectorize.progress.json') // δημιουργία αρχείου για να σωζετε η πρόοδος

interface ProgressData {
  completedIds: string[]
}

const loadProgress = (): ProgressData => {
  try {
    const data = fs.readFileSync(progressFile, 'utf-8')
    return JSON.parse(data) as ProgressData
  } catch {
    return { completedIds: [] }
  }
}

const saveProgress = (data: ProgressData): void => {
  fs.writeFileSync(progressFile, JSON.stringify(data, null, 2), 'utf-8')
}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

// -------------------------------------------------------------
// κύρια συνάρτηση vectorizeAllParagraphs
// -------------------------------------------------------------
/*
  💥 Δημιουργεί vector embeddings για όλα τα paragraphs type:"text"
  και μόνο αν δεν έχουν ήδη vector.
  Χρησιμοποιεί και τους τίτλους (chapterTitle, sectionTitle κλπ) αν υπάρχουν.
*/
export const vectorizeAllParagraphs = async (): Promise<void> => {

  // πρέπει να κάνουμε όλες τις συνδέσεις γιατι είναι standalone script
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  const progress = loadProgress()  // βοηθητική συνάρτηση παραπάνω

  // $nin: not in, φέρνουμε μόνο όσα δεν υπάρχουν στο progress file
  // $exists: false σημαίνει «το πεδίο vector δεν υπάρχει καν μέσα στο document».
  // $size: 0 σημαίνει «το πεδίο vector υπάρχει, αλλά είναι άδειος πίνακας»
  // φέρνουμε μόνο τις παραγράφους που δεν έχουν γίνει vectorize ακόμα
  const paragraphs: ParagraphType[] = await Paragraph.find({
    _id: { $nin: progress.completedIds },
    type: 'text',
    $or: [{ vector: { $exists: false } }, { vector: { $size: 0 } }]
  })

  const total = paragraphs.length
  console.log(`📚 Found ${total} paragraphs left to vectorize`)

  let done = 0 // counter

  for (const p of paragraphs) {
    try {
      if (!p._id) {
        console.warn(`⚠️ Paragraph missing _id, skipping...`)
        continue
      }
      if (!p.text) {
        console.warn(`⚠️ Paragraph has not text, skipping...`)
        continue
      }

      // --- καθαρισμός κειμένου ---
      let cleanText = p.text
        .replace(/\r/g, '')          // αφαιρεί carriage returns
        // .replace(/-\n/g, '')      // ενώνει λέξεις που κόβονται με παύλα
        .replace(/\n+/g, ' ')        // κάνει flatten τις νέες γραμμές
        .replace(/[^\S\r\n]+/g, ' ') // normalizes spaces
        .trim()

      // --- φίλτρα για άχρηστες παραγράφους ---
      if (!cleanText || cleanText.length < 50) continue // μικρότερο απο 50 chars
      if (!/[a-zA-Zα-ωΑ-Ω]/.test(cleanText)) continue // αν το κείμενο δεν περιέχει κανένα γράμμα (λατινικό ή ελληνικό)
      if (cleanText.split(/\s+/).length < 3) continue  // λιγότερες από 3 λέξεις
      // αν πάνω από 40% δεν είναι γράμματα
      const letters = cleanText.match(/[a-zA-Zα-ωΑ-Ω]/g)?.length ?? 0
      const nonLetters = cleanText.length - letters
      if (nonLetters / cleanText.length > 0.4) continue

      // --- δημιουργία nput για το embedding: τίτλοι + κείμενο ---
      const fullText = [
        p.chapterTitle,
        p.sectionTitle,
        p.subsectionTitle,
        p.subsubsectionTitle,
        cleanText
      ]
        .filter(Boolean) // αφαιρεί τα null/undefined πεδία
        .join(' - ') // τα ενώνει σε ένα string

      if (fullText.length < 50) continue

      // --- αποστολή στο OpenAI ---
      const vector = await gptEmbeddingsService.getEmbedding(fullText)
      // το προσθέτω στο mongo document και σώζω
      await Paragraph.findByIdAndUpdate(p._id, { vector })

      progress.completedIds.push(String(p._id))   // βοηθητική συνάρτηση παραπάνω
      saveProgress(progress)

      done++
      const percent = ((done / total) * 100).toFixed(1)
      process.stdout.write(`\r📈 Progress: ${done}/${total} (${percent}%)`)

      // μικρό delay για να αποφύγουμε rate limits
      await sleep(150)

      // μεγαλύτερο διάλειμμα κάθε 300
      if (done % 300 === 0) {
        console.log(`\n💤 Resting 5s to avoid API rate limits...`)
        await sleep(5000)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`\n❌ Error at paragraph: ${message}`)
      break // σταματάμε για να μην κάψουμε tokens
    }
  }

  console.log(`\n🎯 Finished vectorizing ${done}/${total} paragraphs`)
  await mongoose.disconnect()
  console.log('🔌 MongoDB connection closed')
}

// -------------------------------------------------------------
// εκτέλεση
// -------------------------------------------------------------
vectorizeAllParagraphs().catch(err => {
  console.error('❌ Unhandled error:', err)
  mongoose.disconnect()
})
