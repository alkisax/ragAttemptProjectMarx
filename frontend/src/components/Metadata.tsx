import { Box, Typography, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccoridonContextParagraphs from './AccoridonContextParagraphs'
import { useRagChatContext } from '../context/RagChatContext'

const Metadata = () => {
  const { messages, memory } = useRagChatContext()

  // find last assistant message that has context
  const lastAssistant = [...messages]
    .reverse()
    .find(msg => msg.role === 'assistant' && msg.context && msg.context.length > 0)

  if (!lastAssistant) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant='body2' sx={{ color: '#999' }}>
          No metadata yet. Ask a question to load context.
        </Typography>
      </Box>
    )
  }

  const lastQuery = messages[messages.length - 2]?.content || '(unknown query)'

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* --- Latest metadata --- */}
      <Typography variant='h6' sx={{ color: '#ffcc00', mb: 2 }}>
        Latest Query Metadata
      </Typography>
      <AccoridonContextParagraphs message={lastAssistant} />

      {/* 🧠 Rolling Summary Accordion */}
      <Accordion
        sx={{
          bgcolor: '#444',
          boxShadow: 'none',
          mt: 2,
          borderRadius: 1,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffcc00' }} />}>
          <Typography variant='subtitle2' sx={{ color: '#ffcc00', fontWeight: 600 }}>
            Rolling Summary
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            bgcolor: '#222',
            borderRadius: 1,
            color: '#eee'
          }}
        >
          <Typography variant='body2' sx={{ color: '#bbb', whiteSpace: 'pre-wrap' }}>
            {memory.pastSummary || 'No summary yet — ask a few questions first.'}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 💬 Recent Questions Accordion */}
      <Accordion
        sx={{
          bgcolor: '#444',
          boxShadow: 'none',
          mt: 2,
          borderRadius: 1,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffcc00' }} />}>
          <Typography variant='subtitle2' sx={{ color: '#ffcc00', fontWeight: 600 }}>
            Recent Questions
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            bgcolor: '#222',
            borderRadius: 1,
            color: '#eee'
          }}
        >
          {memory.entries.length > 0 ? (
            memory.entries.map((e, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ color: '#ffcc00' }}>
                  Q{i + 1}: {e.query}
                </Typography>
                <Typography variant='body2' sx={{ color: '#ccc', ml: 1 }}>
                  ↳ {e.summary}
                </Typography>
                {i < memory.entries.length - 1 && (
                  <Divider sx={{ my: 1, bgcolor: '#333' }} />
                )}
              </Box>
            ))
          ) : (
            <Typography variant='body2' sx={{ color: '#999' }}>
              No previous questions yet.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* 🔍 Last Query */}
      <Typography variant='body2' sx={{ mt: 3, color: '#bbb' }}>
        <b style={{ color: '#ffcc00' }}>Query:</b> {lastQuery}
      </Typography>
    </Box>
  )
}

export default Metadata
