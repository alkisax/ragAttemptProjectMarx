// backend\src\vectorize\gptEmbeddingsParagraph.routes.ts

/*
  8.
  Routes για τα endpoints vectorization και semantic search.

  prev → backend\src\vectorize\gptEmbeddingsParagraph.controller.ts
  next → 
*/

import { Router } from 'express'
import { gptEmbeddingsParagraphController } from './gptEmbeddingsParagraph.controller'

const router = Router()

// βασικές λειτουργίες RAG
router.post('/search', gptEmbeddingsParagraphController.searchHandler)
router.post('/search-extended', gptEmbeddingsParagraphController.searchHandlerExtended)
router.post('/locate', gptEmbeddingsParagraphController.locateHandler)
router.post('/embed', gptEmbeddingsParagraphController.embedHandler)

export default router
