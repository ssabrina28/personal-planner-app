import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-planner';
  await mongoose.connect(mongoUri);
};

export default connectDB;
