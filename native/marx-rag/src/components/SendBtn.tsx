// native\marx-rag\src\components\SendBtn.tsx
/*
  9.
*/
import React from 'react'
import { View } from 'react-native'
import { TextInput, Button } from 'react-native-paper'

interface Props {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  handleAsk: () => Promise<void>
  loading: boolean
}

export default function SendBtn({ query, setQuery, handleAsk, loading }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TextInput
        mode="flat"
        placeholder="Ask about Marx’s Capital..."
        value={query}
        onChangeText={setQuery}
        style={{ flex: 1, backgroundColor: '#2a2a2a', color: 'white' }}
        onSubmitEditing={() => !loading && handleAsk()}
      />
      <Button
        mode="contained"
        onPress={handleAsk}
        disabled={loading}
        buttonColor="#ffcc00"
        textColor="#000"
      >
        Send
      </Button>
    </View>
  )
}
