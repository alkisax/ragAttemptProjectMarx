import { stripeController } from './stripe.controller';
import { Router } from 'express'

const router = Router()

router.post('/checkout/:price_id', stripeController.createCheckoutSession);
router.get('/success', stripeController.handleSuccess);
router.get('/cancel', stripeController.handleCancel);

export default router