// frontend\src\components\ChatContainer.tsx

import { Box, CircularProgress } from '@mui/material'
import { useRagChat } from '../hooks/useRagChat'
import MessageBubble from './MessageBubble'
import HeaderLogo from './HeaderLogo'
import SendBtn from './SendBtn'

const ChatContainer = () => {
  // 🧠 παίρνουμε όλη τη λογική από το custom hook
  const { query, setQuery, messages, loading, handleAskExtendedHybrid } = useRagChat()

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
          width: '90%',
          maxWidth: 700,
          minHeight: '85vh',
          bgcolor: 'background.default',
          borderRadius: 3,
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 4,
        }}
      >
        {/* Logo + Title */}
        <HeaderLogo />

        {/* Chat */}
        <Box sx={{ width: '100%' }}>
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