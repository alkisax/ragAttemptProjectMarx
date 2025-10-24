// backend\src\types\paragraph.types.ts

/*
  1.
  περιγραφή της παραγράφου μου 
  next: → backend\src\paragraph\paragraph.model.ts
*/
export interface ParagraphType {
  _id?: string
  book?: string | null
  chapter?: number | null
  chapterTitle?: string | null
  sectionTitle?: string | null
  subsectionTitle?: string | null
  subsubsectionTitle?: string | null
  type?: string | null
  paragraphNumber?: number | string | null
  text?: string | null
  hasFootnotes?: string[] | null
  vector?: number[]
}
