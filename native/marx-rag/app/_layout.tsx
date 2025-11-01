// app/_layout.tsx
/*
  1. 
  Root layout of the Marx RAG Native app
  Equivalent to App.tsx — wraps everything with providers and theme.
*/

import { Stack } from 'expo-router'
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper'
import { RagChatProvider } from '../src/context/RagChatContext'
import { VariablesProvider } from '@/src/context/VariablesContext'
import { useEffect } from 'react'
import { Linking, Alert } from 'react-native'

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121212',
    primary: '#ffcc00',
    surface: '#1e1e1e',
  },
}

const RootLayout = () => {

  useEffect(() => {
    // 👂 Listen for deep-link redirects (e.g. marxrag://cancel or marxrag://success)
    const sub = Linking.addEventListener('url', event => {
      const url = event.url

      // check if it contains “cancel” or “success”
      if (url.includes('cancel')) {
        Alert.alert('Payment canceled', 'Your payment was canceled.')
      } else if (url.includes('success')) {
        Alert.alert('Success', 'Thank you for your donation!')
      }
    })

    return () => sub.remove()
  }, [])

  
  return (
    <VariablesProvider>
      {/* UI theme wrapper */}
      <PaperProvider theme={darkTheme}>
        {/* Chat state provider */}
        <RagChatProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#121212' },
            }}
          >
            {/* 👇 the “index.tsx” screen = main chat page */}
            <Stack.Screen name="index" options={{ title: 'Das Kapital' }} />
            <Stack.Screen name="metadata" options={{ title: 'metadata' }} />
            <Stack.Screen name="buy-me-a-coffee" options={{ title: 'Buy me a coffee' }} />
          </Stack>
        </RagChatProvider>
      </PaperProvider>      
    </VariablesProvider>

  )
}

export default RootLayout