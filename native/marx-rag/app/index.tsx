/*
  2.
*/
import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View, ActivityIndicator, StyleSheet } from 'react-native'
import { Button, RadioButton, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useRagChatContext } from '../src/context/RagChatContext'
import MessageBubble from '../src/components/MessageBubble'
import SendBtn from '../src/components/SendBtn'
import HeaderLogo from '../src/components/HeaderLogo'

export default function ChatScreen() {
  const { query, setQuery, messages, loading, handleAskExtendedHybrid, handleAskHybridBook1 } =
    useRagChatContext()
  const [mode, setMode] = useState<'extended' | 'book1'>('extended')

  const router = useRouter()

  const handleAsk = async () => {
    if (mode === 'book1') await handleAskHybridBook1()
    else await handleAskExtendedHybrid()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 📱 KeyboardAvoidingView lifts content when keyboard appears */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.container}>
          <HeaderLogo />

          <View style={styles.modeBox}>
            <RadioButton.Group onValueChange={v => setMode(v as any)} value={mode}>
              <View style={styles.radioRow}>
                <RadioButton value="extended" color="#ffcc00" />
                <Text style={styles.radioText}>Extended (All Books)</Text>
              </View>
              <View style={styles.radioRow}>
                <RadioButton value="book1" color="#ffcc00" />
                <Text style={styles.radioText}>Book 1 Only</Text>
              </View>
            </RadioButton.Group>
          </View>

          <ScrollView style={styles.scroll}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && <ActivityIndicator size="small" color="#ffcc00" />}
          </ScrollView>

          <SendBtn query={query} setQuery={setQuery} handleAsk={handleAsk} loading={loading} />

          <Button
            mode="outlined"
            textColor="#ffcc00"
            style={styles.button}
            onPress={() => router.push({ pathname: '/metadata' })}
          >
            📚 View Context
          </Button>

          <Button
            mode="outlined"
            textColor="#ffcc00"
            style={styles.button}
            onPress={() => router.push({ pathname: '/buy-me-a-coffee' })}
          >
            ☕ Buy me a coffee
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  modeBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  radioText: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#1a1a1a',
    marginBottom: 10,
  },
  button: {
    marginTop: 12,
    borderColor: '#ffcc00',
  },
})
