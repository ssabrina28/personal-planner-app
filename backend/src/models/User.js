import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    theme: {
      type: String,
      enum: ['sapitos', 'unicornios', 'bosque', 'tiburones', 'gatos'],
      default: 'sapitos',
    },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
