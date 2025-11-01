import React, { useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text, Button, Card } from 'react-native-paper'
import * as Linking from 'expo-linking'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useVariables } from '../../src/context/VariablesContext'

// const PUBLIC_STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY
const PRICE_ID_2E = process.env.EXPO_PUBLIC_PRICE_ID_2E

export default function BuyMeACoffee() {
  const { backendUrl } = useVariables()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/stripe/checkout/${PRICE_ID_2E}?platform=native`)
      if (data.url) {
        await Linking.openURL(data.url) // opens device browser to Stripe Checkout
      } else {
        console.error('No checkout URL returned from backend')
      }
    } catch (err) {
      console.error('❌ Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>☕ Support this project</Text>

        <Card style={styles.card}>
          <Image
            source={require('../../assets/three_coins.png')}
            style={styles.image}
          />

          <Text style={styles.donateText}>Donate 2 €</Text>
          <Text style={styles.subtitle}>Wow, you’re a hero! 💪</Text>

          <Button
            mode="contained"
            buttonColor="#ffcc00"
            textColor="#000"
            onPress={handleCheckout}
            loading={loading}
            style={styles.button}
          >
            Donate 2 €
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#ffcc00',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 200,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  donateText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
})
