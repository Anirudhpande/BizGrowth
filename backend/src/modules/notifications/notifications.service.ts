import { Notification, INotification } from './notifications.model';

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
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        channels,
        data,
        relatedId,
        relatedModel,
      });

      await notification.save();

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

      // Update sent timestamp
      await Notification.findByIdAndUpdate(
        notification._id,
        { sentAt: new Date() }
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
    console.log(`Email sent to user ${notification.userId}: ${notification.title}`);
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: INotification): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    console.log(`SMS sent to user ${notification.userId}: ${notification.title}`);
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification: INotification): Promise<void> {
    // TODO: Integrate with push service (Firebase Cloud Messaging, etc.)
    console.log(`Push notification sent to user ${notification.userId}: ${notification.title}`);
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
    const query: any = { userId };
    if (read !== undefined) {
      query.read = read;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments(query);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<any> {
    return await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId,
      read: false,
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(notificationId);
    return !!result;
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: string): Promise<any> {
    return await Notification.deleteMany({ userId });
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
    // Notify consultant
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

    // Notify client
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
    // Notify consultant
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

    // Notify client
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