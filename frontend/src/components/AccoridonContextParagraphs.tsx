// frontend\src\components\AccoridonContextParagraphs.tsx

import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { Message } from "../types/types"

interface Props {
  message: Message
}

const AccoridonContextParagraphs = ({ message }: Props) => {

  // early return if no context
  if (!message.context || message.context.length === 0) return null
  
  return (
    <>
      {/* 
      Το Accordion είναι ένα expandable container, δηλαδή ένα κουτί που: στην αρχή δείχνει μόνο έναν τίτλο (summary), και όταν το πατήσεις, ξεδιπλώνεται (expand) για να δείξει το περιεχόμενο του (details).
      Ένα Accordion έχει τρεις βασικές ενότητες:
      <Accordion>
        <AccordionSummary> ...ό,τι βλέπεις όταν είναι κλειστό... </AccordionSummary>
        <AccordionDetails> ...ό,τι εμφανίζεται όταν το ανοίξεις... </AccordionDetails>
      </Accordion>
      */}
      <Accordion
        sx={{
          bgcolor: '#444', // darker accordion background to match dark theme
          boxShadow: 'none',
          mt: 1,
          borderRadius: 1,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffcc00' }} />}>
          <Typography
            variant='subtitle2'
            sx={{
              color: '#ffcc00',
              fontWeight: 600
            }}>
            Context paragraphs
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            bgcolor: '#222',
            borderRadius: 1,
            color: '#eee',
          }}
        >
          {message.context.map((p, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              {/* Metadata block */}
              <Typography variant='body2' sx={{ color: '#ffcc00', fontWeight: 600 }}>
                Paragraph {p.paragraphNoTotal ?? '?'}
                {p.score && (
                  <Typography component='span' sx={{ color: '#999', fontSize: '0.8rem', ml: 1 }}>
                    (score: {p.score.toFixed ? p.score.toFixed(3) : p.score})
                  </Typography>
                )}
              </Typography>

              {/* Optional hierarchy info */}
              <Typography variant='body2' sx={{ color: '#bbb' }}>
                {[
                  p.book && `Book: ${p.book}`,
                  p.chapter && `Chapter: ${p.chapter}`,
                  p.chapterTitle && `“${p.chapterTitle}”`,
                  p.sectionTitle && `Section: ${p.sectionTitle}`,
                  p.subsectionTitle && `Subsection: ${p.subsectionTitle}`,
                  p.subsubsectionTitle && `Subsubsection: ${p.subsubsectionTitle}`
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>

              {/* Actual paragraph text */}
              <Typography variant='body2' sx={{ color: '#ccc', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {p.text}
              </Typography>

              {i < message.context!.length - 1 && (
                <Divider sx={{ my: 1, bgcolor: '#333' }} />
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default AccoridonContextParagraphs