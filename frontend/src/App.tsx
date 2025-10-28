// frontend\src\App.tsx
/*
  σχόλια για όλο το front:
  εχουμε 2 βασικά components:
    chat cntainer: η handleAsk κάνει axios.post<RagResponse>(`${backendUrl}/api/rag/ask`, { query })
    και κάνει render το background το βασικό κουτι και το κουτί διαλόγου
    MessageBubble: μου κάνει render τα στοιχεία του διαλόγου (και το expandable με τις πηγές)
    ( το RagChat είναι ένα δοκιμαστικό αρχείο που δεν καλείτε κάπου )
*/

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material'
import ResponsiveLayout from './layout/ResponsiveLayout'
import { Route, Routes } from 'react-router-dom'

// 🌙 Define dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    primary: {
      main: '#ffcc00', // yellowish tone
    },
  },
  typography: {
    allVariants: {
      color: '#fff',
    },
  },
})

const App = () => (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />

        <Routes>
          {/* use same / path, render responsive layout */}
          <Route path="/*" element={<ResponsiveLayout />} />
        </Routes>

  </ThemeProvider>
)

export default App
