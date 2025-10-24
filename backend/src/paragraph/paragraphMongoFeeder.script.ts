// backend\src\paragraph\paragraphMongoFeeder.script.ts

/*
  4.
  standalone script that reads every JSON chapter file and inserts all paragraphs to Mongo.
  run once with:
    npm run mongo:paragraphs

  getAllJsonFiles, μου επιστρέφει ένα arr με όλα τα filepaths των φακέλων (πχ backend/data/book1)

  feedParagraphs, Έχει δύο for:
  μια για να διατρέξει και να διαβάσει όλα τα αρχεία:
    const content = fs.readFileSync(file, 'utf-8')
    const paragraphs: ParagraphType[] = JSON.parse(content)
  και μια για κάθε παράγραφο του json αρχείο μου. Δημιουργεί ένα document mongo με:
    const data: Partial<ParagraphType> = {
      ...p,
      vector: []
    }
    await paragraphDAO.createParagraph(data)

  prev → backend\src\paragraph\paragraphMongoFeeder.script.ts
  next → backend\src\vectorize\gptEmbeddingsParagraph.service.ts
*/

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { paragraphDAO } from './paragraph.dao'
import type { ParagraphType } from '../types/paragraph.types'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI as string

const getAllJsonFiles = (dir: string): string[] => {
  // returns an array of names (strings) like ['chapter1.json', 'chapter2.json', 'book2'].
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      // μας φτιάχνει Paths τύπου backend\data\book3\chapter34.json
      const fullPath = path.join(dir, entry.name)
      files.push(fullPath)
    }
  }

  // ενα array με τα Paths του κάθε αρχείου
  return files
}

// path to your local scraped folders (book1, book2, book3)
// η resolve μου φτιάχνει ένα absolute path (D:\coding\etc)
// η __dirname μου δίνει το path του αρχείου. Όποτε για να πάω απο το backend\src\paragraph\ στο backend\data → ../../data
const baseDir = path.resolve(__dirname, '../../data')

const bookDirs = [
  path.join(baseDir, 'book1'),
  path.join(baseDir, 'book2'),
  path.join(baseDir, 'book3')
]

let allFiles: string[] = []
// καταλήγω με ενα array με τα Paths του κάθε αρχείου απο όλους τους φακέλους
for (const dir of bookDirs) {
  const files = getAllJsonFiles(dir) // ενα array με τα Paths του κάθε αρχείου
  allFiles = allFiles.concat(files) // η push θα μου τα έβαζε μέσα σαν arr ενώ η concat μου τα βάζει ως στοιχει
}

const feedParagraphs = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    console.log(`📚 Found ${allFiles.length} chapter files`)

    let totalInserted = 0

    for (const file of allFiles) {
      // read this file synchronously, means the program pauses here until the file is completely read. 'utf-8' tells Node to interpret the file bytes as text (Unicode string), not raw binary.
      const content = fs.readFileSync(file, 'utf-8')
      // JSON.parse() converts the string above into real JavaScript objects. The result is an array of objects (each representing one paragraph).
      const paragraphs: ParagraphType[] = JSON.parse(content)

      let count = 0
      let insertedForFile = 0

      for (const p of paragraphs) {
        try {
          // φτιάχνω τα data. Δηλ παίρνω το κάθε json obj όπως το έκανα scrape και του προσθέτων ένα κενο vector field
          const data: Partial<ParagraphType> = {
            ...p,
            vector: []
          }
          // και σώζω την παράγραφο στην mongo
          await paragraphDAO.createParagraph(data)

          // Every 50 paragraphs, print a progress message.
          if ((count + 1) % 50 === 0) {
            console.log(`✅ Inserted ${count + 1} paragraphs so far`)
          }

          count++
          insertedForFile++

        } catch (err) {
          if (err instanceof Error) {
            console.warn(`⚠️ Skipped paragraph ${count + 1}: ${err.message}`)
          } else {
            console.warn(`⚠️ Unknown error at paragraph ${count + 1}`)
          }
        }
      }

      console.log(`📘 Finished ${path.basename(file)} → ${insertedForFile} paragraphs inserted`)
      totalInserted += insertedForFile
    }

    console.log(`🎯 Total inserted paragraphs: ${totalInserted}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error feeding paragraphs:', error.message)
    } else {
      console.error('❌ Unknown error during feeding')
    }
  } finally {
    await mongoose.disconnect()
    console.log('🔌 MongoDB connection closed')
  }
}

feedParagraphs()
