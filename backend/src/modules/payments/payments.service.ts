import crypto from 'crypto';
import db from '../../config/db';
import { IPayment } from './payments.model';

// Lazy Razorpay getter
let _razorpay: any = null;
function getRazorpay() {
  if (!_razorpay) {
    const Razorpay = require('razorpay');
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _razorpay = new Razorpay({ key_id, key_secret });
  }
  return _razorpay;
}

const PAYMENTS_TABLE = 'payments';

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

      const order = await getRazorpay().orders.create(options);

      await db.query(
        `INSERT INTO ${PAYMENTS_TABLE} (booking_id, consultant_id, client_id, amount, currency, razorpay_order_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bookingId, consultantId, clientId, amount, currency, order.id, 'pending']
      );

      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Create Razorpay order for marketplace listing product purchase
   */
  async createListingOrder(
    listingId: string,
    sellerId: string,
    buyerId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_list_${listingId.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
        notes: {
          listingId,
          sellerId,
          buyerId,
        },
      };

      const order = await getRazorpay().orders.create(options);

      await db.query(
        `INSERT INTO ${PAYMENTS_TABLE} (listing_id, consultant_id, client_id, amount, currency, razorpay_order_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [listingId, sellerId, buyerId, amount, currency, order.id, 'pending']
      );

      return order;
    } catch (error) {
      throw new Error(`Failed to create listing order: ${error}`);
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
    if (process.env.NODE_ENV !== 'production' && razorpaySignature === 'SIMULATED_SIGNATURE') {
      return true;
    }
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

      const newStatus = status === 'captured' ? 'completed' : 'failed';
      const res = await db.query(
        `UPDATE ${PAYMENTS_TABLE} SET razorpay_payment_id = $1, payment_method = $2, status = $3, error_message = $4, updated_at = NOW() WHERE razorpay_order_id = $5 RETURNING *`,
        [id, method, newStatus, error_reason, order_id]
      );

      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      throw new Error(`Failed to handle webhook: ${error}`);
    }
  }

  /**
   * Update payment after signature verification
   */
  async updatePaymentAfterVerification(
    razorpayOrderId: string,
    razorpayPaymentId: string
  ): Promise<IPayment | null> {
    try {
      const res = await db.query(
        `UPDATE ${PAYMENTS_TABLE} SET razorpay_payment_id = $1, status = 'completed', updated_at = NOW() WHERE razorpay_order_id = $2 RETURNING *`,
        [razorpayPaymentId, razorpayOrderId]
      );

      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to update payment: ${error}`);
      return null;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    try {
      const res = await db.query(`SELECT * FROM ${PAYMENTS_TABLE} WHERE id = $1`, [paymentId]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch payment: ${error}`);
      return null;
    }
  }

  /**
   * Get payment by Razorpay order ID
   */
  async getPaymentByOrderId(razorpayOrderId: string): Promise<IPayment | null> {
    try {
      const res = await db.query(`SELECT * FROM ${PAYMENTS_TABLE} WHERE razorpay_order_id = $1`, [razorpayOrderId]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch payment: ${error}`);
      return null;
    }
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
    try {
      let countQueryStr = `SELECT COUNT(*) FROM ${PAYMENTS_TABLE} WHERE consultant_id = $1`;
      let dataQueryStr = `SELECT * FROM ${PAYMENTS_TABLE} WHERE consultant_id = $1`;
      const values: any[] = [consultantId];

      if (status) {
        countQueryStr += ` AND status = $2`;
        dataQueryStr += ` AND status = $2`;
        values.push(status);
      }

      const countRes = await db.query(countQueryStr, values);
      const total = parseInt(countRes.rows[0].count, 10);

      dataQueryStr += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      const dataRes = await db.query(dataQueryStr, [...values, limit, skip]);

      return { payments: dataRes.rows, total };
    } catch (error) {
      console.error(`Failed to fetch payments: ${error}`);
      return { payments: [], total: 0 };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(consultantId: string): Promise<any> {
    try {
      const res = await db.query(`SELECT amount FROM ${PAYMENTS_TABLE} WHERE consultant_id = $1 AND status = 'completed'`, [consultantId]);
      
      const payments = res.rows;
      if (payments.length === 0) {
        return { totalEarnings: 0, totalPayments: 0, avgAmount: 0 };
      }

      const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const avgAmount = totalEarnings / payments.length;

      return {
        totalEarnings,
        totalPayments: payments.length,
        avgAmount: Math.round(avgAmount * 100) / 100,
      };
    } catch (error) {
      console.error(`Failed to fetch payment stats: ${error}`);
      return { totalEarnings: 0, totalPayments: 0, avgAmount: 0 };
    }
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
      const payment = await this.getPaymentById(paymentId);

      if (!payment || !payment.razorpay_payment_id) {
        throw new Error('Payment not found or not completed');
      }

      const refundOptions: any = {
        amount: refundAmount ? refundAmount * 100 : undefined,
        notes: {
          reason: refundReason,
        },
      };

      const refund = await getRazorpay().payments.refund(
        payment.razorpay_payment_id,
        refundOptions
      );

      await db.query(
        `UPDATE ${PAYMENTS_TABLE} SET status = 'refunded', refund_amount = $1, refund_reason = $2, updated_at = NOW() WHERE id = $3`,
        [refundAmount || payment.amount, refundReason, paymentId]
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
    try {
      const res = await db.query(
        `SELECT payment_method, amount FROM ${PAYMENTS_TABLE} WHERE consultant_id = $1 AND status = 'completed'`,
        [consultantId]
      );

      const stats: any = {};
      res.rows.forEach((payment) => {
        const method = payment.payment_method || 'unknown';
        if (!stats[method]) {
          stats[method] = { count: 0, totalAmount: 0 };
        }
        stats[method].count++;
        stats[method].totalAmount += payment.amount || 0;
      });

      return Object.entries(stats).map(([method, data]: any) => ({
        _id: method,
        count: data.count,
        totalAmount: data.totalAmount,
      }));
    } catch (error) {
      console.error(`Failed to fetch payment method stats: ${error}`);
      return [];
    }
  }
}
