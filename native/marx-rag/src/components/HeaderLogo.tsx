// native\marx-rag\src\components\HeaderLogo.tsx
/*
  10.
*/
import React from 'react'
import { View, Image, Text } from 'react-native'

export default function HeaderLogo() {
  return (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <Image
        source={require('../../assets/gramota.jpg')}
        style={{ width: 100, height: 100, borderRadius: 12 }}
      />
      <Text style={{ color: '#ffcc00', fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
        Das Kapital
      </Text>
      <Text style={{ color: '#ffcc00', fontSize: 14 }}>AI Assistant for Karl Marx</Text>
    </View>
  )
}
