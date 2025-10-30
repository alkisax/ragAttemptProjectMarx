// backend\src\vectorize\gptEmbeddingsParagraph.controller.ts

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
// αυτή εδώ δεν χρησιμοποιήτε στο backend\src\rag\gptRagParagraph.controller.ts οποτε δεν έχει και καμια χρήση άλλη εκτός του testing
// αυτό μου επιστρέφει απλως τις κοντινες νοηματικα παραγράφους χωρις δημιουργεία κάποιου κειμένου απο το chatgpt
const searchHandler = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // Κάνουμε vectorize την ερώτηση και semantic search στα paragraphs
    // old 🐌
    // const results = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)
    // new mongo vector search 🐇
    const results = await gptEmbeddingsService.semanticSearchParagraphsVector(query, 5)

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

    // 🔹 1️⃣ Semantic search — top 5 matches
    // old 🐌
    // const topMatches = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)
    // new mongo vector search 🐇
    const topMatches = await gptEmbeddingsService.semanticSearchParagraphsVector(query, 5)
    const expandedResults = []

    for (const match of topMatches) {
      const { book, chapter, paragraphNumber } = match
      const pNum = Number(paragraphNumber)

      // 🔹 2️⃣ Context paragraphs ±3 (handles numeric or string paragraphNumbers)
      // 🔹 Fetch ±3 paragraphs (casting paragraphNumber strings to numbers)
      const context = await Paragraph.aggregate([
        {
          $addFields: {
            paragraphNum: { $toDouble: '$paragraphNumber' } // cast to number
          }
        },
        {
          $match: {
            book,
            chapter,
            type: 'text',
            paragraphNum: { $gte: pNum - 3, $lte: pNum + 3 }
          }
        },
        { $sort: { paragraphNum: 1 } }
      ])

      // 🔹 3️⃣ Merge context paragraphs (fallback if none found)
      const mergedText =
        context.length > 0
          ? context.map(p => p.text).filter(Boolean).join(' ')
          : match.text ?? ''

      // 🔹 4️⃣ Push result summary
      expandedResults.push({
        book: match.book,
        chapter: match.chapter,
        chapterTitle: match.chapterTitle,
        sectionTitle: match.sectionTitle,
        subsectionTitle: match.subsectionTitle,
        subsubsectionTitle: match.subsubsectionTitle,
        paragraphNumber: match.paragraphNumber,
        centerParagraph: {
          _id: match._id,
          paragraphNumber: match.paragraphNumber,
          text: match.text
            ? match.text.split(/\s+/).slice(0, 5).join(' ') + '...'
            : '',
          score: match.score
        },
        mergedText
      })
    }

    // 🔹 5️⃣ Return all enriched matches
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
// 2️⃣ searchHandlerSomeExtended (επεκτεταμένο με context ±2 παραγράφους)
// -------------------------------------------------------------
// αυτή είναι copy paste της ακριβώς απο πάνω. μόνο που αντ για ±3 → ±2
const searchHandlerSomeExtended = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // 🔹 1️⃣ Semantic search — top 5 matches
    // old 🐌
    // const topMatches = await gptEmbeddingsService.semanticSearchParagraphs(query, 5)
    // new mongo vector search 🐇
    const topMatches = await gptEmbeddingsService.semanticSearchParagraphsVector(query, 5)
    const expandedResults = []

    for (const match of topMatches) {
      const { book, chapter, paragraphNumber } = match
      const pNum = Number(paragraphNumber)

      // 🔹 2️⃣ Context paragraphs ±3 (handles numeric or string paragraphNumbers)
      // 🔹 Fetch ±3 paragraphs (casting paragraphNumber strings to numbers)
      const context = await Paragraph.aggregate([
        {
          $addFields: {
            paragraphNum: { $toDouble: '$paragraphNumber' } // cast to number
          }
        },
        {
          $match: {
            book,
            chapter,
            type: 'text',
            paragraphNum: { $gte: pNum - 2, $lte: pNum + 2 }
          }
        },
        { $sort: { paragraphNum: 1 } }
      ])

      // 🔹 3️⃣ Merge context paragraphs (fallback if none found)
      const mergedText =
        context.length > 0
          ? context.map(p => p.text).filter(Boolean).join(' ')
          : match.text ?? ''

      // 🔹 4️⃣ Push result summary
      expandedResults.push({
        book: match.book,
        chapter: match.chapter,
        chapterTitle: match.chapterTitle,
        sectionTitle: match.sectionTitle,
        subsectionTitle: match.subsectionTitle,
        subsubsectionTitle: match.subsubsectionTitle,
        paragraphNumber: match.paragraphNumber,
        centerParagraph: {
          _id: match._id,
          paragraphNumber: match.paragraphNumber,
          text: match.text
            ? match.text.split(/\s+/).slice(0, 5).join(' ') + '...'
            : '',
          score: match.score
        },
        mergedText
      })
    }

    // 🔹 5️⃣ Return all enriched matches
    return res.status(200).json({
      status: true,
      count: expandedResults.length,
      data: expandedResults
    })
  } catch (error) {
    return handleControllerError(res, error)
  }
}

// 💣💣 14 💥💥αυτό προστέθηκε μετά το βήμα 13 ο σκοπός είναι να φτιαχτεί index με βάση το κείμενο ωστε να κάνουμε hybrid search με semantic και με BM25 (text-based)
// next → backend\src\vectorize\gptEmbeddingsParagraph.routes.ts
// θα φτιαξουμε δύο ίδιες. Μια για απλο search hybrid και μια μια για extended some (+-2) hybrid search 
const searchHandlerHybrid = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // το search τώρα γίνετε με hybrid (BM25 + Semantic)
    const results = await gptEmbeddingsService.hybridSearchParagraphs(query, 5)

    return res.status(200).json({
      status: true,
      count: results.length,
      data: results
    })
  } catch (error) {
    return handleControllerError(res, error)
  }
}


// 💣💣 14 💥💥
// -------------------------------------------------------------
// searchHandlerSomeExtendedHybrid — μικτή αναζήτηση με context ±2
// -------------------------------------------------------------
const searchHandlerSomeExtendedHybrid = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // Μικτή αναζήτηση (BM25 + Semantic)
    const topMatches = await gptEmbeddingsService.hybridSearchParagraphs(query, 5)
    const expandedResults: any[] = []

    // Για κάθε match → βρες ±2 παραγράφους
    for (const match of topMatches) {
      const { book, chapter, paragraphNumber } = match
      const pNum = Number(paragraphNumber)

      const context = await Paragraph.aggregate([
        {
          $addFields: { paragraphNum: { $toDouble: '$paragraphNumber' } }
        },
        {
          $match: {
            book,
            chapter,
            type: 'text',
            paragraphNum: { $gte: pNum - 2, $lte: pNum + 2 }
          }
        },
        { $sort: { paragraphNum: 1 } }
      ])

      // Συγχώνευση context (merged text)
      const mergedText =
        context.length > 0
          ? context.map(p => p.text).filter(Boolean).join(' ')
          : match.text ?? ''

      // Αποθήκευση enriched αποτελέσματος
      expandedResults.push({
        book: match.book,
        chapter: match.chapter,
        chapterTitle: match.chapterTitle,
        sectionTitle: match.sectionTitle,
        subsectionTitle: match.subsectionTitle,
        subsubsectionTitle: match.subsubsectionTitle,
        paragraphNumber: match.paragraphNumber,
        centerParagraph: {
          _id: match._id,
          paragraphNumber: match.paragraphNumber,
          text: match.text
            ? match.text.split(/\s+/).slice(0, 5).join(' ') + '...'
            : '',
          score: match.finalScore // 👈 Χρησιμοποιούμε το hybrid score
        },
        mergedText
      })
    }

    // Επιστροφή enriched results
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
// 💣15.💥 Hybrid search μόνο για Book 1 (χωρίς ±2 context)
// -------------------------------------------------------------
const searchHandlerHybridBook1 = async (req: Request, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing query in body' })
    }

    // Μικτή αναζήτηση (BM25 + Semantic) ΜΟΝΟ για Book 1
    const topMatches = await gptEmbeddingsService.hybridSearchParagraphsBook1(query, 5)

    // Δεν επεκτείνουμε με ±2, επιστρέφουμε τις ίδιες παραγράφους με metadata
    const plainResults = topMatches.map(match => ({
      _id: match._id,
      book: match.book,
      chapter: match.chapter,
      chapterTitle: match.chapterTitle,
      sectionTitle: match.sectionTitle,
      subsectionTitle: match.subsectionTitle,
      subsubsectionTitle: match.subsubsectionTitle,
      paragraphNumber: match.paragraphNumber,
      text: match.text,
      score: match.finalScore // use hybrid score
    }))

    return res.status(200).json({
      status: true,
      count: plainResults.length,
      data: plainResults
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
    // new mongo vector search 🐇
    const matches = await gptEmbeddingsService.semanticSearchParagraphsVector(query, 20)
    // old 🐌
    // const matches = await gptEmbeddingsService.semanticSearchParagraphs(query, 20)

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
  searchHandlerSomeExtended,
  searchHandlerHybrid,
  searchHandlerSomeExtendedHybrid,
  searchHandlerHybridBook1,
  locateHandler,
  embedHandler
}
