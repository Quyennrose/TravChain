import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travchain';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (error) {
    if (process.env.MONGODB_URI) {
      throw error;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production. Serverless Vercel functions cannot start mongodb-memory-server reliably.');
    }

    console.warn('Local MongoDB unavailable. Starting in-memory MongoDB for development.');
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri(), { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB memory server connected');
  }
}
