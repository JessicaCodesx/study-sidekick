// tests/setup.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

// Create an in-memory MongoDB instance for testing
let mongoServer;

// Setup before tests
export async function setupDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
}

// Teardown after tests
export async function teardownDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

// Create mock authentication middleware
export function mockAuthMiddleware(userId = 'test-user-id') {
  return (req, res, next) => {
    req.user = { id: userId, email: 'test@example.com' };
    next();
  };
}

// Generate a mock auth token
export function generateMockToken(userId = 'test-user-id') {
  return jwt.sign({ uid: userId }, 'test-secret-key');
}

// Clear all collections between tests
export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}