// native\marx-rag\src\components\MessageBubble.tsx
/*
  8.
*/
import React from 'react'
import { View, Text } from 'react-native'
import type { Message } from '../types/types'

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user'
  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? '#ffcc00' : '#333',
        borderRadius: 10,
        padding: 8,
        marginVertical: 4,
        maxWidth: '85%',
      }}
    >
      <Text style={{ color: isUser ? '#000' : '#f5f5f5' }}>{message.content}</Text>
    </View>
  )
}

export default MessageBubble
