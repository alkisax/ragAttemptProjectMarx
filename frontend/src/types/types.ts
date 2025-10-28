// frontend/src/types/types.ts

/*
  💡 These types are aligned with the backend's paragraph.types.ts
  but simplified for rendering (MessageBubble) and extended-mode compatibility.
*/

export interface ParagraphBase {
  _id?: string
  book?: string | null
  chapter?: number | null
  chapterTitle?: string | null
  sectionTitle?: string | null
  subsectionTitle?: string | null
  subsubsectionTitle?: string | null
  paragraphNumber?: number | string | null
  text?: string | null
  score?: number | null
}

/*
  Extended paragraph data used by `/ask-extended` endpoint.
  Contains a merged block of text (± context paragraphs) and a short center paragraph.
*/
export interface ExtendedParagraph extends ParagraphBase {
  mergedText?: string | null
  centerParagraph?: {
    _id?: string
    paragraphNumber?: number | string | null
    text?: string | null
    score?: number | null
  }
}

/*
  Normalized context for the frontend display (always same shape after normalization)
*/
export interface ParagraphContext {
  paragraphNoTotal: number | string | null
  text: string
  // 🧭 Optional metadata (added for Accordion display)
  book?: string
  chapter?: number
  chapterTitle?: string
  sectionTitle?: string
  subsectionTitle?: string
  subsubsectionTitle?: string
  score?: number
}

/*
  Response type from backend (generic enough for both ask and ask-extended)
*/
export interface RagResponse {
  answer: string
  context: (ParagraphBase | ExtendedParagraph)[]
}

/*
  A single chat message in frontend memory
*/
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: ParagraphContext[]
}
