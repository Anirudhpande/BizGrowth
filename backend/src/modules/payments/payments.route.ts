import { Router } from 'express';
import { PaymentsController } from './payments.controller';

const router = Router();
const controller = new PaymentsController();

// Payments routes
router.post('/create-order', (req, res) => controller.createOrder(req, res));
router.post('/verify', (req, res) => controller.verifyPayment(req, res));
router.post('/webhook', (req, res) => controller.handleWebhook(req, res));
router.get('/:paymentId', (req, res) => controller.getPayment(req, res));
router.get('/consultant/:consultantId', (req, res) => controller.getConsultantPayments(req, res));
router.get('/consultant/:consultantId/stats', (req, res) => controller.getPaymentStats(req, res));
router.post('/:paymentId/refund', (req, res) => controller.refundPayment(req, res));

export default router;