/*
  13.
  💥 RAG Memory Routes — endpoints για σύνοψη απάντησης και ενημέρωση συνολικής περίληψης.

  prev → backend\src\ragMemory\RagMemory.controller.ts
  next → frontend
*/

import express from 'express'
import { gptRagMemoryController } from './RagMemory.controller'

const router = express.Router()

// -------------------------------------------------------------
// POST /api/rag-memory/summarize-answer
// 🔹 Παίρνει πλήρη απάντηση → επιστρέφει συνοπτική περίληψη
// -------------------------------------------------------------
router.post('/summarize-answer', gptRagMemoryController.summarizeAnswer)

// -------------------------------------------------------------
// POST /api/rag-memory/update-summary
// 🔹 Συνδυάζει προηγούμενη περίληψη + 4η ερώτηση + περίληψη απάντησης → νέα cumulative περίληψη
// -------------------------------------------------------------
router.post('/update-summary', gptRagMemoryController.updateDiscussionSummary)

export default router


/*
frontend sequence per question will be:
1️⃣ User submits a new query
→ POST /api/rag/ask-extended → receive answer.
2️⃣ Immediately summarize the answer
→ POST /api/rag-memory/summarize-answer → get answerSummary.
3️⃣ Update the rolling memory state in your frontend:
Shift A→B, B→C, C→D.
If D overflows → call:
POST /api/rag-memory/update-summary
with old pastSummary, queryD, and answerSummaryD.
4️⃣ Save new pastDiscussionSummary returned from the above.
Include it next time you call /ask-extended.
*/