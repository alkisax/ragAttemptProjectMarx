// backend\src\paragraph\paragraph.model.ts

/*
  2.
  μοντέλο της παραγράφου μου
  prev → backend\src\types\paragraph.types.ts
  next → backend\src\paragraph\paragraph.dao.ts
*/

import mongoose from 'mongoose'
import type { ParagraphType } from '../types/paragraph.types'

const paragraphSchema = new mongoose.Schema<ParagraphType>({
  book: { type: String, required: true },
  chapter: { type: Number },
  chapterTitle: { type: String },
  sectionTitle: { type: String },
  subsectionTitle: { type: String },
  subsubsectionTitle: { type: String },
  type: { type: String, default: ' ' },
  paragraphNumber: { type: mongoose.Schema.Types.Mixed },
  text: { type: String },
  hasFootnotes: { type: [String], default: [] },
  vector: { type: [Number], default: [] }
}, { timestamps: true })

export default mongoose.model<ParagraphType>('Paragraph', paragraphSchema)
