/*
  7.
  💥 Δύο controller συναρτήσεις:
    1️⃣ searchHandler → vectorise της ερώτησης, cosine similarity, επιστρέφει τα Ν κοντινότερα αποτελέσματα
    2️⃣ embedHandler → βοηθητικό endpoint για να πάρεις vector ενός text (debug / test)

  prev → backend\src\vectorize\gptEmbeddingsParagraph.service.ts
  next → backend\src\vectorize\gptEmbeddingsParagraph.routes.ts
*/

import type { Request, Response } from 'express'
import { gptEmbeddingsService } from './gptEmbeddingsParagraph.service'
import { handleControllerError } from '../utils/error/errorHandler';
import Paragraph from '../paragraph/paragraph.model'

// -------------------------------------------------------------
//  GET /api/vectorize/search
// -------------------------------------------------------------
const searchHandler = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // Κάνουμε vectorize την ερώτηση και semantic search στα paragraphs
    const results = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)

    return res.status(200).json({ status: true, data: results })
  } catch (error) {
    return handleControllerError(res, error);
  }
}


// -------------------------------------------------------------
// 2️⃣ searchHandlerExtended (επεκτεταμένο με context ±3 παραγράφους)
// -------------------------------------------------------------
const searchHandlerExtended = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // 🔹 Κάνουμε semantic search για τις 5 πιο κοντινές
    const topMatches = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)
    const expandedResults = []

    for (const match of topMatches) {
      const { book, chapter, paragraphNumber } = match
      const pNum = Number(paragraphNumber)

      // 🔹 Φέρνουμε ±3 παραγράφους γύρω από το αποτέλεσμα
      const context = await Paragraph.find({
        book,
        chapter,
        paragraphNumber: { $gte: pNum - 3, $lte: pNum + 3 },
        type: 'text'
      })
        .sort({ paragraphNumber: 1 })
        .lean()

      // 🔹 Δημιουργούμε ενιαίο string με όλο το context για GPT prompt
      const mergedText = context.map(p => p.text).join(' ')


      expandedResults.push({
        book: match.book,
        chapter: match.chapter,
        chapterTitle: match.chapterTitle,
        sectionTitle: match.sectionTitle,
        subsectionTitle: match.subsectionTitle,
        subsubsectionTitle: match.subsubsectionTitle,
        paragraphNumber: match.paragraphNumber,
        // κρατάμε μόνο τα βασικά στοιχεία του match
        centerParagraph: {
          _id: match._id,
          paragraphNumber: match.paragraphNumber,
          // 🧩 δείχνει μόνο τις πρώτες 5 λέξεις
          text: match.text
            ? match.text.split(/\s+/).slice(0, 5).join(' ') + '...'
            : '',
          score: match.score
        },
        mergedText
      })
    }

    return res.status(200).json({
      status: true,
      count: expandedResults.length,
      data: expandedResults
    })
  } catch (error) {
    return handleControllerError(res, error)
  }
}

// -------------------------------------------------------------
//  POST /api/vectorize/locate
//  💥 Επιστρέφει τα κεφάλαια στα οποία γίνεται συζήτηση για ένα θέμα
//  (π.χ. “surplus value”, “commodity fetishism” κλπ.)
// -------------------------------------------------------------
const locateHandler = async (req: Request, res: Response) => {
  try {
    // Παίρνουμε το query από το body
    const { query } = req.body

    // Αν λείπει ή δεν είναι string → error 400 (bad request)
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query' })
    }

    // Κάνουμε semantic search στις παραγράφους για το query
    // Ζητάμε τις 20 πιο σχετικές παραγράφους συνολικά (top 20)
    const matches = await gptEmbeddingsService.semanticSearchParagraphs(query, 20)

    // Θέλουμε να ομαδοποιήσουμε τα αποτελέσματα ανά βιβλίο + κεφάλαιο.
    // Θα έχουμε ένα object με κλειδί π.χ. "book 1-10"
    // και τιμή { chapterTitle: "...", paragraphs: [ "text1", "text2", ... ] }

    // Δηλώνουμε ένα κενό object που θα γεμίσουμε παρακάτω.
    const grouped: Record<string, { chapterTitle?: string; paragraphs: string[] }> = {}

    // Για κάθε παράγραφο που βρέθηκε
    for (const m of matches) {
      // Δημιουργούμε ένα κλειδί που ταυτοποιεί το κεφάλαιο
      const key = `${m.book}-${m.chapter}`

      // Αν δεν υπάρχει ακόμα αυτό το κεφάλαιο στο grouped object, το δημιουργούμε
      if (!grouped[key]) {
        grouped[key] = {
          chapterTitle: m.chapterTitle ?? undefined, // ο τίτλος του κεφαλαίου
          paragraphs: []  // αρχικά άδειος πίνακας παραγράφων
        }
      }

      // Προσθέτουμε το text αυτής της παραγράφου στο array του κεφαλαίου.
      // Αν το text είναι null/undefined, βάζουμε άδειο string για ασφάλεια.
      grouped[key].paragraphs.push(m.text ?? '')
    }

    // Τέλος, επιστρέφουμε το grouped object ως JSON response.
    //    Η δομή είναι π.χ.:
    //    {
    //      "book 1-10": {
    //        "chapterTitle": "Chapter Nine: The Rate of Surplus-Value",
    //        "paragraphs": [
    //          "We have seen that the labourer...",
    //          "During the second period...",
    //          ...
    //        ]
    //      },
    //      "book 2-5": {
    //        "chapterTitle": "The Transformation of Capital into Profit",
    //        "paragraphs": ["Profit is only another name...", ...]
    //      }
    //    }
    return res.json({ status: true, data: grouped })
  } catch (error) {
    return handleControllerError(res, error)
  }
}

// -------------------------------------------------------------
//  POST /api/vectorize/embed
// -------------------------------------------------------------
const embedHandler = async (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing text in body' })
    }

    const vector = await gptEmbeddingsService.getEmbedding(text)
    return res.status(200).json({ status: true, vector })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ status: false, message })
  }
}

export const gptEmbeddingsParagraphController = {
  searchHandler,
  searchHandlerExtended,
  locateHandler,
  embedHandler
}
