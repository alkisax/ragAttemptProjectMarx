import type { Request, Response } from 'express'
import * as stripeService from './stripe.service'
// import * as transactionDAO from '../daos/transaction.dao'
// import * as participantDAO from '../daos/participant.dao'

// -----------------------------
// 1️⃣ Create Checkout Session
// -----------------------------
const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const price_id = req.params.price_id

  try {
    // added participantInfo to catch participant url params
    const session = await stripeService.createCheckoutSession(price_id)
    res.json(session)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error creating checkout session:', msg)
    res.status(500).json({ error: msg })
  }
}

// ---------------------------------------------------------------
// 2️⃣ Handle Success Route (called by Stripe after successful pay)
// ---------------------------------------------------------------
// επειδή το τεστ γινόνταν με κανονικα λεφτα κράτησα μερικα url επιστροφής.
// http://localhost:5173/success?success=true&session_id=cs_live_a1IFuqog2PoU5HNXKFt81GAPOlduJc0c3YbfZuZiEko3xAarddwMDooLS5

// αν τα βάλεις στον browser θα συμπεριφερθει σαν επιτυχεία συναλαγής
// δημιουργόντας transaction και ανανεώνοντας τον participant.
const handleSuccess = async (req: Request, res: Response): Promise<Response> => {
  try {
    // συλλέγω διάφορα δεδομένα του χρήστη απο το url του success
    const sessionId = req.query.session_id as string | undefined
    if (!sessionId) {
      return res.status(400).send('Missing session ID.')
    }

    return res.send('Thank you so much for your donation. Your generosity means everything to us and to the community we serve.')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error processing success route:', msg)
    return res.status(500).send('Something went wrong.')
  }
}

// -----------------------------
// 3️⃣ Handle Cancel Route
// -----------------------------
const handleCancel = (_req: Request, res: Response): Response => {
  return res.send('Payment canceled! :(')
}

export const stripeController = {
  createCheckoutSession,
  handleSuccess,
  handleCancel
}