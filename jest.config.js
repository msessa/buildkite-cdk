module.exports = {
  testEnvironment: 'node',
  runner: "groups",
  roots: [
    '<rootDir>/src/handler/test'
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
