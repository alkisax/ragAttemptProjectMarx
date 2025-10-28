// frontend\src\components\SendBtn.tsx

import { Box, Button, TextField } from "@mui/material"
import type { Dispatch, SetStateAction } from 'react'

interface Props {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  handleAsk: () => Promise<void>
  loading: boolean
}

const SendBtn = ({ query, setQuery, handleAsk, loading}: Props) => {

  // ✨ Υποβολή με Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      void handleAsk()
    }
  }

  return(   
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        label="Ask about Marx's Capital..."
        variant='filled'
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          bgcolor: '#2a2a2a',
          borderRadius: 1,
        }}
        slotProps={{
          inputLabel: { style: { color: '#bbb' } },
          input: { style: { color: 'white' } },
        }}
      />
      <Button
        variant='contained'
        color='primary'
        onClick={handleAsk}
        disabled={loading}
        sx={{ fontWeight: 'bold' }}
      >
        Send
      </Button>
    </Box>
  )
}

export default SendBtn