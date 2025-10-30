/**
 * Jest test setup file
 * Configures test environment for database tests
 */

// Extend Jest timeout for database operations
jest.setTimeout(30000);

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
