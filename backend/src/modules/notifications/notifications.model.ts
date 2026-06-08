import { Schema, model } from 'mongoose';

interface INotification {
  _id?: string;
  userId: string;
  type: 'booking' | 'review' | 'payment' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  relatedId?: string;
  relatedModel?: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['booking', 'review', 'payment', 'reminder', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    channels: {
      type: [String],
      enum: ['email', 'sms', 'push', 'in-app'],
      default: ['in-app'],
    },
    relatedId: {
      type: String,
      index: true,
    },
    relatedModel: {
      type: String,
      enum: ['Booking', 'Review', 'Payment'],
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
export type { INotification };