// frontend\src\components\MessageBubble.tsx

import { Box, Typography } from '@mui/material'
import type { Message } from '../types/types'
import AccoridonContextParagraphs from './AccoridonContextParagraphs'

interface Props {
  message: Message
}

const MessageBubble = ({ message }: Props) => {
  const isUser = message.role === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
        my: 1,
      }}
    >
      <Box
        sx={{
          bgcolor: isUser ? '#816700ff' : '#333', // user = yellow, assistant = dark gray
          color: isUser ? '#000' : '#f5f5f5', // black text for user, light text for assistant
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: { xs: '85%', lg: '90%' },  // bubble size relative to chat width
          alignSelf: 'flex-start',             // prevent centering vertically
          wordBreak: 'break-word',             // break long tokens gracefully
          whiteSpace: 'pre-wrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>
          {message.content}
        </Typography>
        
        {!isUser && message.context && message.context.length > 0 && (
          <AccoridonContextParagraphs message={message}/>
        )}
      </Box>
    </Box>
  )
}

export default MessageBubble
