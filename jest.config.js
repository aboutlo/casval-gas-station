module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/node_modules/", "/dist"],
  globalSetup: './src/test/jest.global.setup.ts',
  globalTeardown: './src/test/jest.global.teardown.ts'
};