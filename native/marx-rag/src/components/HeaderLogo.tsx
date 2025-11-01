/*
  10.
*/
import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'

export default function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/gramota.jpg')}
        style={styles.image}
      />
      <Text style={styles.title}>Das Kapital</Text>
      <Text style={styles.subtitle}>AI Assistant for Karl Marx</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  title: {
    color: '#ffcc00',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    color: '#ffcc00',
    fontSize: 14,
  },
})
