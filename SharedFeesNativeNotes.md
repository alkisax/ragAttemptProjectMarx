`npx create-expo-app marx-rag`
`npm run reset-project`

```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npm install axios
npm install react-native-dotenv
```

για να κανει render πάνω απο τα κουμπιά του android
- 'npx expo install react-native-safe-area-context
'

- React Native doesn’t have MUI, so we’ll use React Native Paper, which provides Appbar, IconButton, and Material-style icons.
`npx expo install react-native-paper react-native-vector-icons`

## Login

| Feature | Web version | Native equivalent |
|----------|--------------|-------------------|
| `localStorage` | Browser API | `expo-secure-store` |
| Navigation (`useNavigate`) | React Router | `expo-router`’s `useRouter()` |
| MUI TextField / Button | MUI | `react-native-paper`’s `TextInput` / `Button` |
| `jwtDecode` | same | same package (`jwt-decode`) |
| Axios + Context logic | same | same |
| Environment variable (`VITE_BACKEND_URL`) | `import.meta.env` | `process.env.EXPO_PUBLIC_BACKEND_URL` |

```bash
npm install axios jwt-decode
npx expo install expo-secure-store react-native-paper
```

- ετσι διωχνω το ts error στα νέα Paths
```bash
rm -rf .expo node_modules/.cache
npx expo start --tunnel --clear
```

# profile
# user view
```bash
npm i expo-camera
npx expo install expo-document-picker
npx expo install expo-image-manipulator
npx expo install react-native-appwrite react-native-url-polyfill
```

# apk
```bash
npm i -g eas-cli
eas login
# https://expo.dev
eas init
# αφού βάλω env
eas build --platform android --profile production
```


📝  Android application id Learn more: https://expo.fyi/android-package
√ What would you like your Android application id to be? ... com.alkisax.sharedfeesnative