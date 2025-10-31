// native\marx-rag\app\buy-me-a-coffee\_layout.tsx
import { Stack } from 'expo-router'

export default function BuyMeACoffeeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1e1e1e' },
        headerTintColor: '#ffcc00',
        contentStyle: { backgroundColor: '#121212' },
      }}
    />
  )
}