import { Schema, model } from 'mongoose';

interface IAvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
}

interface IAvailability {
  _id?: string;
  consultantId: string;
  slots: IAvailabilitySlot[];
  timezone: string;
  breakTimes?: Array<{
    startTime: string;
    endTime: string;
  }>;
  blockedDates?: Date[];
  maxConsultationsPerDay?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const availabilitySlotSchema = new Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const availabilitySchema = new Schema<IAvailability>(
  {
    consultantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slots: [availabilitySlotSchema],
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    breakTimes: [
      {
        startTime: String,
        endTime: String,
      },
    ],
    blockedDates: [Date],
    maxConsultationsPerDay: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export const Availability = model<IAvailability>('Availability', availabilitySchema);
export type { IAvailability, IAvailabilitySlot };