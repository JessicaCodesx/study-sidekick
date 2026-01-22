// jest.config.js
export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  testTimeout: 30000,
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // For Node.js ESM
  // Prevent coverage testing from triggering the actual tests
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'config/**/*.js'
  ],
  // For ES modules support
  transformIgnorePatterns: [
    'node_modules/(?!(@babel|mongoose))'
  ],
  // Setup Jest with ESM modules
  setupFilesAfterEnv: ['./setupJest.js']
};