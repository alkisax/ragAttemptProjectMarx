// backend\src\paragraph\paragraph.dao.ts

/* 
  3.
  DAO. Στα αλήθεια χρησιμοποιώ μόνο την createParagraph
  prev → backend\src\paragraph\paragraph.model.ts
  next → backend\src\paragraph\paragraphMongoFeeder.script.ts
*/
import Paragraph from './paragraph.model'
import type { ParagraphType } from '../types/paragraph.types'
import { ValidationError } from '../utils/error/errors.types'

const createParagraph = async (data: Partial<ParagraphType>): Promise<ParagraphType> => {
  if (data.paragraphNumber === null || data.paragraphNumber === undefined) {
    data.paragraphNumber = 'meta'
  }
  const paragraph = new Paragraph(data)
  return paragraph.save()
}

const createManyParagraphs = async (paragraphs: ParagraphType[]): Promise<ParagraphType[]> => {
  if (!paragraphs.length) {
    throw new ValidationError('Paragraph list is empty')
  }

  return Paragraph.insertMany(paragraphs, { ordered: false })
}

const getAll = async (): Promise<ParagraphType[]> => {
  return Paragraph.find().limit(100)
}

const findById = async (id: string): Promise<ParagraphType | null> => {
  return Paragraph.findById(id)
}

export const paragraphDAO = {
  createParagraph,
  createManyParagraphs,
  getAll,
  findById
}
