// // ( το RagChat είναι ένα δοκιμαστικό αρχείο που δεν καλείτε κάπου )

// import { useState } from 'react'
// import { Box, TextField, Button, CircularProgress, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import axios from 'axios'
// import type { RagResponse } from '../types/types' 

// const RagChat = () => {
//   const [query, setQuery] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [response, setResponse] = useState<RagResponse | null>(null)

//   const handleAsk = async () => {
//     if (!query.trim()) return
//     setLoading(true)
//     try {
//       const res = await axios.post<RagResponse>('/api/rag/ask', { query })
//       setResponse(res.data)
//     } catch (err) {
//       console.error('Error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
//       <Typography variant='h5' sx={{ mb: 2 }}>Chat with your document</Typography>

//       <Box sx={{ display: 'flex', gap: 1 }}>
//         <TextField
//           fullWidth
//           label='Ask something...'
//           value={query}
//           onChange={e => setQuery(e.target.value)}
//         />
//         <Button variant='contained' onClick={handleAsk} disabled={loading}>
//           {loading ? <CircularProgress size={20} /> : 'Ask'}
//         </Button>
//       </Box>

//       {response && (
//         <Box sx={{ mt: 4 }}>
//           <Typography variant='h6'>Answer:</Typography>
//           <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
//             {response.answer}
//           </Typography>

//           <Accordion sx={{ mt: 2 }}>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Typography>Context paragraphs</Typography>
//             </AccordionSummary>
//             <AccordionDetails>
//               {response.context.map((p, i) => (
//                 <Typography key={i} sx={{ mb: 1 }}>
//                   <b>Page {p.page}</b>: {p.text}
//                 </Typography>
//               ))}
//             </AccordionDetails>
//           </Accordion>
//         </Box>
//       )}
//     </Box>
//   )
// }

// export default RagChat
