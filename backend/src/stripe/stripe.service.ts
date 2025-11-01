// αγοράστικε το portfolio-projects.space απο namecheap 1.98$ 31/10/2025
// backend\src\stripe\stripe.service.ts

import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

// initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// constants
const QUANTITY = 1

// -----------------------------
// 1️⃣ Create Checkout Session
// -----------------------------
export const createCheckoutSession = async (
  priceId: string,
  platform: 'web' | 'native' = 'web'
): Promise<{ id: string; url: string | null }> => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment')
  }

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
  const FRONTEND_PATH = process.env.FRONTEND_PATH || '/capital'

   // 🧠 Default URLs (for web)
  let success_url = `${FRONTEND_URL}${FRONTEND_PATH}/success?success=true&session_id={CHECKOUT_SESSION_ID}`
  let cancel_url = `${FRONTEND_URL}${FRONTEND_PATH}?canceled=true`

  // 📱 Override for native app
  if (platform === 'native') {
    const APP_SCHEME = process.env.APP_SCHEME || 'marxrag'
    success_url = `${APP_SCHEME}://success?session_id={CHECKOUT_SESSION_ID}`
    cancel_url = `${APP_SCHEME}://cancel`
  }

  console.log('💳 Creating checkout session', { platform, success_url, cancel_url })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: QUANTITY,
      },
    ],
    mode: 'payment',
    success_url,
    cancel_url,
  })

  return { id: session.id, url: session.url }
}

// -----------------------------
// 2️⃣ Retrieve Checkout Session
// -----------------------------
export const retrieveSession = async (
  sessionId: string
): Promise<Stripe.Checkout.Session> => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment')
  }
  return await stripe.checkout.sessions.retrieve(sessionId)
}
