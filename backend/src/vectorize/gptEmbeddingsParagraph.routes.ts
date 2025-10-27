// backend\src\vectorize\gptEmbeddingsParagraph.routes.ts

/*
  8.
  Routes για τα endpoints vectorization και semantic search.

  prev → backend\src\vectorize\gptEmbeddingsParagraph.controller.ts
  next → backend\src\rag\gptRag.service.ts
*/

import { Router } from 'express'
import { gptEmbeddingsParagraphController } from './gptEmbeddingsParagraph.controller'

const router = Router()

// αυτό μου επιστρέφει απλως τις κοντινες νοηματικα παραγράφους χωρις δημιουργεία κάποιου κειμένου απο το chatgpt
router.post('/search', gptEmbeddingsParagraphController.searchHandler)
router.post('/search-extended', gptEmbeddingsParagraphController.searchHandlerExtended)
router.post('/search-some-extended', gptEmbeddingsParagraphController.searchHandlerSomeExtended)
router.post('/locate', gptEmbeddingsParagraphController.locateHandler)

router.post('/search-hybrid', gptEmbeddingsParagraphController.searchHandlerHybrid)
router.post('/search-some-extended-hybrid', gptEmbeddingsParagraphController.searchHandlerSomeExtendedHybrid)

// ⚠️
router.post('/embed', gptEmbeddingsParagraphController.embedHandler)

export default router
