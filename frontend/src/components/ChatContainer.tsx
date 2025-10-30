// frontend\src\components\ChatContainer.tsx

import { Box, Button, CircularProgress, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
// import { useRagChat } from '../hooks/useRagChat'
import { useRagChatContext } from '../context/RagChatContext'
import MessageBubble from './MessageBubble'
import HeaderLogo from './HeaderLogo'
import SendBtn from './SendBtn'
import { useState } from 'react'

const ChatContainer = () => {

  // αυτο λειτουργούσε καλά αλλα τελικά φτιάξαμε το RagChatContext για να μπορούμε να έχουμε σε όλα τα components τις ίδιες πληροφορίες ταυτόχρονα
  // const { query, setQuery, messages, loading, handleAskExtendedHybrid } = useRagChat()
  const { query, setQuery, messages, loading, handleAskExtendedHybrid, handleAskHybridBook1 } = useRagChatContext()

  const [mode, setMode] = useState<'extended' | 'book1'>('extended')

  const handleAsk = async () => {
    if (mode === 'book1') await handleAskHybridBook1()
    else await handleAskExtendedHybrid()
  }

  return (
    // Εξωτερικό φόντο — σκούρο γκρι, κεντράρει το μαύρο κουτί
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      {/* Μαύρο κουτί */}
      <Box
        sx={{
          width: { xs: '90%', lg: '100%' },           // take full width only on lg+
          maxWidth: { xs: 700, lg: 'none' },          // remove maxWidth limit on lg+
          minHeight: { xs: '95vh', lg: '100vh' },     // stretch vertically on lg+
          bgcolor: 'background.default',
          borderRadius: { xs: 3, lg: 0 },             // remove rounded corners for full-screen look
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 4,
          my: 1,
        }}
      >
        {/* Logo + Title — visible only on desctop lg */}
        <Box sx={{ display: { md: 'block', lg: 'none' } }}>
          <HeaderLogo />
        </Box>

        {/* 🆕 Radio Selector */}
        <FormControl component='fieldset' sx={{ mb: 3 }}>
          <RadioGroup
            row
            value={mode}
            onChange={e => setMode(e.target.value as 'extended' | 'book1')}
          >
            <FormControlLabel
              value='extended'
              control={<Radio color='primary' />}
              label='Extended Search (All Books)'
            />
            <FormControlLabel
              value='book1'
              control={<Radio color='primary' />}
              label='Book 1 Only'
            />
          </RadioGroup>
        </FormControl>

        {/* Chat */}
        <Box 
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              mb: 3,
              height: { xs: '59vh', lg: '83vh' },
              overflowY: 'auto',
              border: '1px solid #333',
              borderRadius: 2,
              p: 2,
              bgcolor: '#1a1a1a',
              flexShrink: 0, // prevent squeezing the input below view
            }}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
            )}
          </Box>

          {/* input & submit */}
          <SendBtn 
            query={query}
            setQuery={setQuery}
            handleAsk={handleAsk}
            loading={loading}
          />

          {/* ✅ Buy me a coffee link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              component={RouterLink}
              to='/checkout'
              variant='outlined'
              color='warning'
              sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
            >
              ☕ Buy me a coffee
            </Button>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}

export default ChatContainer