// frontend/src/components/StripeSuccessListener.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

const StripeSuccessListener = () => {
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const success = params.get('success')
    const sessionId = params.get('session_id')

    if (success && sessionId) {
      axios
        .get(`${BACKEND_URL}/api/stripe/success?session_id=${sessionId}`)
        .then(res => {
          const msg = typeof res.data === 'string' ? res.data : 'Payment success!'
          alert(msg) // ✅ your success alert
        })
        .catch(err => {
          console.error('Error verifying payment:', err)
        })
        .finally(() => {
          // clean URL so you stay on home
          window.history.replaceState({}, '', '/capital/')
        })
    }
  }, [location])

  return null
}

export default StripeSuccessListener
