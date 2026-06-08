import { Schema, model } from 'mongoose';

interface IBooking {
  _id?: string;
  consultantId: string;
  clientId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    consultantId: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    meetingLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>('Booking', bookingSchema);
export type { IBooking };