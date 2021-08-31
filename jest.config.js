module.exports = {
  testEnvironment: 'node',
  runner: "groups",
  roots: [
    '<rootDir>/src/test',
    '<rootDir>/src/cfn-handlers/test'
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
