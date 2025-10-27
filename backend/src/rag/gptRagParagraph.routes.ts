// backend\src\rag\gptRagParagraph.routes.ts
/*
  11.
  💥 RAG Routes — σύνδεση του controller με το Express router

  prev → backend\src\rag\gptRagParagraph.controller.ts
  next → frontend integration
*/

import express from 'express'
import { gptRagParagraphController } from './gptRagParagraph.controller'

const router = express.Router()

// -------------------------------------------------------------
// POST /api/rag/ask
// 💬 Στέλνει ερώτηση στο RAG σύστημα.
// Κάνει semantic search, φτιάχνει prompt, και καλεί GPT για απάντηση.
// -------------------------------------------------------------
router.post('/ask', gptRagParagraphController.askWithContext)
router.post('/ask-extended', gptRagParagraphController.askWithContextExtended)
// 💣💣 14 💥💥
router.post('/ask-hybrid', gptRagParagraphController.askWithContextHybrid)
router.post('/ask-extended-hybrid', gptRagParagraphController.askWithContextExtendedHybrid)


export default router
