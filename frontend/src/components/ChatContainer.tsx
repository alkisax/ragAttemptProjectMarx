// frontend\src\components\ChatContainer.tsx

import { Box, CircularProgress } from '@mui/material'
// import { useRagChat } from '../hooks/useRagChat'
import { useRagChatContext } from '../context/RagChatContext'
import MessageBubble from './MessageBubble'
import HeaderLogo from './HeaderLogo'
import SendBtn from './SendBtn'

const ChatContainer = () => {

  // αυτο λειτουργούσε καλά αλλα τελικά φτιάξαμε το RagChatContext για να μπορούμε να έχουμε σε όλα τα components τις ίδιες πληροφορίες ταυτόχρονα
  // const { query, setQuery, messages, loading, handleAskExtendedHybrid } = useRagChat()
  const { query, setQuery, messages, loading, handleAskExtendedHybrid } = useRagChatContext()

  return (
    // Εξωτερικό φόντο — σκούρο γκρι, κεντράρει το μαύρο κουτί
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Μαύρο κουτί */}
      <Box
        sx={{
          width: { xs: '90%', lg: '100%' },           // take full width only on lg+
          maxWidth: { xs: 700, lg: 'none' },          // remove maxWidth limit on lg+
          minHeight: { xs: '85vh', lg: '100vh' },     // stretch vertically on lg+
          bgcolor: 'background.default',
          borderRadius: { xs: 3, lg: 0 },             // remove rounded corners for full-screen look
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 4,
        }}
      >
        {/* Logo + Title — visible only on desctop lg */}
        <Box sx={{ display: { md: 'block', lg: 'none' } }}>
          <HeaderLogo />
        </Box>

        {/* Chat */}
        <Box 
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              mb: 3,
              height: '60vh',
              overflowY: 'auto',
              border: '1px solid #333',
              borderRadius: 2,
              p: 2,
              bgcolor: '#1a1a1a',
            }}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
            )}
          </Box>

          <SendBtn 
            query={query}
            setQuery={setQuery}
            handleAsk={handleAskExtendedHybrid}
            loading={loading}
          />

        </Box>
      </Box>
    </Box>
  )
}

export default ChatContainer