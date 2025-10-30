import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import threeCoins from '../assets/three_coins.svg.png'


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

      const result = await stripe.redirectToCheckout({ sessionId: data.id })
      if (result.error) console.error(result.error.message)
    } catch (err) {
      console.error('❌ Payment error:', err)
    }
  }

  return (
    <div className='container mt-5' style={{ backgroundColor: '#242424', color: 'white' }}>
      <h1 className='mb-4 text-center'>Support this demo</h1>
      <div className='row justify-content-center'>
        <div className='col-12 col-sm-4 mb-4'>
          <div className='card border border-white p-3 h-100'>
            <img src={threeCoins} className='card-img-top' alt='Donate 2€' />
            <div className='card-body text-center'>
              <h5 className='card-title'>Donate 2€</h5>
              <p className='card-text'>Wow, you’re a hero! 💪</p>
              <button className='btn btn-warning' onClick={() => handleCheckout(PRICE_ID_2E)}>
                Donate 2€
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
