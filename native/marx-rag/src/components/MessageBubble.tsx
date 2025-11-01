/*
  8.
*/
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { Message } from '../types/types'

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user'
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={isUser ? styles.userText : styles.assistantText}>
        {message.content}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 10,
    padding: 8,
    marginVertical: 4,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffcc00',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  userText: {
    color: '#000',
  },
  assistantText: {
    color: '#f5f5f5',
  },
})

export default MessageBubble
