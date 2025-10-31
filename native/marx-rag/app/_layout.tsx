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
          </Stack>
        </RagChatProvider>
      </PaperProvider>      
    </VariablesProvider>

  )
}

export default RootLayout