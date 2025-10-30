import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import threeCoins from '../assets/three_coins.svg.png'
import { Box, Button, Card, CardContent, CardMedia, Container, Typography } from '@mui/material'

const BACKEND_URL = 'http://localhost:3001'
const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY as string
const PRICE_ID_2E = import.meta.env.VITE_PRICE_ID_2E as string

const stripePromise = loadStripe(PUBLIC_STRIPE_KEY)

const Checkout = () => {
  const handleCheckout = async (priceId: string) => {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/stripe/checkout/${priceId}`)
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to initialize')

      // 🔥 new redirect method
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned from backend')
      }
    } catch (err) {
      console.error('❌ Payment error:', err)
    }
  }

 return (
    <Container
      maxWidth='sm'
      sx={{
        backgroundColor: '#242424',
        color: 'white',
        py: 6,
        borderRadius: 2,
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 600 }}>
        ☕ Support this demo
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Card
          sx={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: '1px solid #555',
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          <CardMedia
            component='img'
            image={threeCoins}
            alt='Donate 2€'
            sx={{
              height: 180,
              objectFit: 'contain',
              backgroundColor: '#000'
            }}
          />
          <CardContent>
            <Typography variant='h5' gutterBottom>
              Donate 2€
            </Typography>
            <Typography variant='body2' sx={{ mb: 2, opacity: 0.8 }}>
              Wow, you’re a hero! 💪
            </Typography>
            <Button
              variant='contained'
              color='warning'
              onClick={() => handleCheckout(PRICE_ID_2E)}
              sx={{ fontWeight: 600, borderRadius: 2, px: 4 }}
            >
              Donate 2€
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Checkout
