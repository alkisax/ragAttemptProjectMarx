// app/index.tsx
/*
  2.
*/
import React, { useState } from 'react'
import { ScrollView, View, ActivityIndicator } from 'react-native'
import { Button, RadioButton, Text } from 'react-native-paper'
import { useRagChatContext } from '../src/context/RagChatContext'
import MessageBubble from '../src/components/MessageBubble'
import SendBtn from '../src/components/SendBtn'
import HeaderLogo from '../src/components/HeaderLogo'

export default function ChatScreen() {
  const { query, setQuery, messages, loading, handleAskExtendedHybrid, handleAskHybridBook1 } =
    useRagChatContext()
  const [mode, setMode] = useState<'extended' | 'book1'>('extended')

  const handleAsk = async () => {
    if (mode === 'book1') await handleAskHybridBook1()
    else await handleAskExtendedHybrid()
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', padding: 16 }}>
      <HeaderLogo />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
        <RadioButton.Group onValueChange={v => setMode(v as any)} value={mode}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
            <RadioButton value="extended" color="#ffcc00" />
            <Text style={{ color: '#fff' }}>Extended (All Books)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="book1" color="#ffcc00" />
            <Text style={{ color: '#fff' }}>Book 1 Only</Text>
          </View>
        </RadioButton.Group>
      </View>

      <ScrollView
        style={{
          flex: 1,
          borderColor: '#333',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          backgroundColor: '#1a1a1a',
          marginBottom: 10,
        }}
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && <ActivityIndicator size="small" color="#ffcc00" />}
      </ScrollView>

      <SendBtn query={query} setQuery={setQuery} handleAsk={handleAsk} loading={loading} />

      <Button
        mode="outlined"
        textColor="#ffcc00"
        style={{ marginTop: 12, borderColor: '#ffcc00' }}
        onPress={() => console.log('☕ Buy me a coffee')}
      >
        ☕ Buy me a coffee
      </Button>
    </View>
  )
}
