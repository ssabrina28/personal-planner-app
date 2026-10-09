import mongoose from 'mongoose';

const plannerEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['task', 'event', 'note', 'finance', 'habit'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    completed: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    category: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('PlannerEntry', plannerEntrySchema);
