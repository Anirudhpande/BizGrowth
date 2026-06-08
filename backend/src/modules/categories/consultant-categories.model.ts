import { Schema, model } from 'mongoose';

interface IConsultantCategory {
  _id?: string;
  consultantId: string;
  categoryId: string;
  createdAt?: Date;
}

const consultantCategorySchema = new Schema<IConsultantCategory>(
  {
    consultantId: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique consultant-category pairs
consultantCategorySchema.index({ consultantId: 1, categoryId: 1 }, { unique: true });

export const ConsultantCategory = model<IConsultantCategory>(
  'ConsultantCategory',
  consultantCategorySchema
);
export type { IConsultantCategory };