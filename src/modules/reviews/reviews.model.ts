import { Schema, model } from 'mongoose';

interface IReview {
  _id?: string;
  bookingId: string;
  consultantId: string;
  clientId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  helpful?: number; // count of helpful votes
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
export type { IReview };