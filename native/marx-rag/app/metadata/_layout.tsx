// native\marx-rag\metadata\_layout.tsx
import { Stack } from 'expo-router'

export default function MetadataLayout() {
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