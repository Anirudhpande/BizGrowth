import { Schema, model } from 'mongoose';

interface ICategory {
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  consultantCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    consultantCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);
export type { ICategory };