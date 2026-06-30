import db from '../../config/db';
import { INotification } from './notifications.model';

const NOTIFICATIONS_TABLE = 'notifications';

export class NotificationsService {
  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    channels: string[] = ['in-app'],
    data?: any,
    relatedId?: string,
    relatedModel?: string
  ): Promise<INotification> {
    try {
      const res = await db.query(
        `INSERT INTO ${NOTIFICATIONS_TABLE} (user_id, type, title, message, channels, data, related_id, related_model) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, type, title, message, JSON.stringify(channels), JSON.stringify(data || {}), relatedId, relatedModel]
      );

      const notification = res.rows[0];
      // Send via channels
      await this.sendViaChannels(notification);
      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  /**
   * Send notification via channels
   */
  async sendViaChannels(notification: INotification): Promise<void> {
    try {
      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            await this.sendEmail(notification);
            break;
          case 'sms':
            await this.sendSMS(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'in-app':
            // In-app notifications are stored in DB
            break;
        }
      }

      await db.query(
        `UPDATE ${NOTIFICATIONS_TABLE} SET sent_at = NOW() WHERE id = $1`,
        [notification.id]
      );
    } catch (error) {
      console.error(`Failed to send via channels: ${error}`);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: INotification): Promise<void> {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`Email sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: INotification): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    console.log(`SMS sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification: INotification): Promise<void> {
    // TODO: Integrate with push service (Firebase Cloud Messaging, etc.)
    console.log(`Push notification sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    read?: boolean,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      let countQueryStr = `SELECT COUNT(*) FROM ${NOTIFICATIONS_TABLE} WHERE user_id = $1`;
      let dataQueryStr = `SELECT * FROM ${NOTIFICATIONS_TABLE} WHERE user_id = $1`;
      const queryValues: any[] = [userId];

      if (read !== undefined) {
        countQueryStr += ` AND read = $2`;
        dataQueryStr += ` AND read = $2`;
        queryValues.push(read);
      }

      const countRes = await db.query(countQueryStr, queryValues);
      const total = parseInt(countRes.rows[0].count, 10);

      dataQueryStr += ` ORDER BY created_at DESC LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      
      const dataRes = await db.query(dataQueryStr, [...queryValues, limit, skip]);
      return { notifications: dataRes.rows, total };
    } catch (error) {
      console.error(`Failed to fetch notifications: ${error}`);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<INotification | null> {
    try {
      const res = await db.query(
        `UPDATE ${NOTIFICATIONS_TABLE} SET read = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [notificationId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to mark notification as read: ${error}`);
      return null;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<any> {
    try {
      await db.query(
        `UPDATE ${NOTIFICATIONS_TABLE} SET read = true, updated_at = NOW() WHERE user_id = $1 AND read = false`,
        [userId]
      );
      return { success: true };
    } catch (error) {
      console.error(`Failed to mark all as read: ${error}`);
      return { success: false };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const res = await db.query(
        `SELECT COUNT(*) FROM ${NOTIFICATIONS_TABLE} WHERE user_id = $1 AND read = false`,
        [userId]
      );
      return parseInt(res.rows[0].count, 10);
    } catch (error) {
      console.error(`Failed to get unread count: ${error}`);
      return 0;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await db.query(`DELETE FROM ${NOTIFICATIONS_TABLE} WHERE id = $1`, [notificationId]);
      return true;
    } catch (error) {
      console.error(`Failed to delete notification: ${error}`);
      return false;
    }
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: string): Promise<any> {
    try {
      await db.query(`DELETE FROM ${NOTIFICATIONS_TABLE} WHERE user_id = $1`, [userId]);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete all notifications: ${error}`);
      return { success: false };
    }
  }

  /**
   * Send booking notification
   */
  async notifyBookingCreated(
    consultantId: string,
    clientId: string,
    bookingId: string,
    bookingTime: string
  ): Promise<void> {
    await this.createNotification(
      consultantId,
      'booking',
      'New Booking Received',
      `You have a new booking scheduled for ${bookingTime}`,
      ['email', 'push', 'in-app'],
      { bookingTime },
      bookingId,
      'Booking'
    );

    await this.createNotification(
      clientId,
      'booking',
      'Booking Confirmed',
      'Your booking has been confirmed',
      ['email', 'in-app'],
      {},
      bookingId,
      'Booking'
    );
  }

  /**
   * Send payment notification
   */
  async notifyPaymentSuccess(
    consultantId: string,
    clientId: string,
    amount: number,
    paymentId: string
  ): Promise<void> {
    await this.createNotification(
      consultantId,
      'payment',
      'Payment Received',
      `You received ₹${amount} for a booking`,
      ['email', 'push', 'in-app'],
      { amount },
      paymentId,
      'Payment'
    );

    await this.createNotification(
      clientId,
      'payment',
      'Payment Successful',
      `Your payment of ₹${amount} has been processed`,
      ['email', 'in-app'],
      { amount },
      paymentId,
      'Payment'
    );
  }

  /**
   * Send review notification
   */
  async notifyReviewReceived(
    consultantId: string,
    rating: number,
    reviewId: string
  ): Promise<void> {
    await this.createNotification(
      consultantId,
      'review',
      'New Review Received',
      `You received a ${rating}-star review`,
      ['email', 'push', 'in-app'],
      { rating },
      reviewId,
      'Review'
    );
  }

  /**
   * Send reminder notification
   */
  async sendReminder(
    userId: string,
    title: string,
    message: string,
    bookingId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'reminder',
      title,
      message,
      ['email', 'push', 'in-app'],
      {},
      bookingId,
      'Booking'
    );
  }
}
