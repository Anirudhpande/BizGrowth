import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment, IPayment } from './payments.model';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class PaymentsService {
  /**
   * Create Razorpay order
   */
  async createOrder(
    bookingId: string,
    consultantId: string,
    clientId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${bookingId}`,
        notes: {
          bookingId,
          consultantId,
          clientId,
        },
      };

      const order = await razorpay.orders.create(options);

      // Save payment record
      const payment = new Payment({
        bookingId,
        consultantId,
        clientId,
        amount,
        currency,
        razorpayOrderId: order.id,
        status: 'pending',
      });

      await payment.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Handle payment webhook
   */
  async handlePaymentWebhook(webhookData: any): Promise<IPayment | null> {
    try {
      const paymentData = webhookData.payload.payment.entity;
      const { order_id, id, method, status, error_reason } = paymentData;

      // Find and update payment
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: order_id },
        {
          razorpayPaymentId: id,
          paymentMethod: method,
          status: status === 'captured' ? 'completed' : 'failed',
          errorMessage: error_reason,
        },
        { new: true }
      );

      return payment;
    } catch (error) {
      throw new Error(`Failed to handle webhook: ${error}`);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    return await Payment.findById(paymentId);
  }

  /**
   * Get payment by Razorpay order ID
   */
  async getPaymentByOrderId(razorpayOrderId: string): Promise<IPayment | null> {
    return await Payment.findOne({ razorpayOrderId });
  }

  /**
   * Get all payments for consultant
   */
  async getConsultantPayments(
    consultantId: string,
    status?: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ payments: IPayment[]; total: number }> {
    const query: any = { consultantId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Payment.countDocuments(query);

    return { payments, total };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(consultantId: string): Promise<any> {
    const stats = await Payment.aggregate([
      { $match: { consultantId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    return stats.length > 0
      ? stats[0]
      : { totalEarnings: 0, totalPayments: 0, avgAmount: 0 };
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    refundAmount?: number,
    refundReason?: string
  ): Promise<any> {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment || !payment.razorpayPaymentId) {
        throw new Error('Payment not found or not completed');
      }

      const refundOptions: any = {
        amount: refundAmount ? refundAmount * 100 : undefined,
        notes: {
          reason: refundReason,
        },
      };

      const refund = await razorpay.payments.refund(
        payment.razorpayPaymentId,
        refundOptions
      );

      // Update payment status
      await Payment.findByIdAndUpdate(
        paymentId,
        {
          status: 'refunded',
          refundAmount: refundAmount || payment.amount,
          refundReason,
        },
        { new: true }
      );

      return refund;
    } catch (error) {
      throw new Error(`Failed to refund payment: ${error}`);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethodStats(consultantId: string): Promise<any> {
    const stats = await Payment.aggregate([
      { $match: { consultantId, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return stats;
  }
}