// setupJest.js
// This file is used to set up Jest with ESM and handle any global setup
// that should happen before all tests run

// Import any needed ESM modules
import { jest } from '@jest/globals';

// Set Jest timeout (optional)
jest.setTimeout(30000);

// Log that setup is complete
console.log('Jest setup complete');