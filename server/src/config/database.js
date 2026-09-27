import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    await mongoose.connect(uri);
  } catch (error) {
    await mongoose.disconnect();
    throw new Error('Could not connect to MongoDB', { cause: error });
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB connection lost');
  });

  console.log('Connected to MongoDB');
}
