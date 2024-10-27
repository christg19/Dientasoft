module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts', '<rootDir>/tests/setup/jest.setup.ts'],
    testMatch: ['<rootDir>/tests/specs/**/*.test.ts'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverage: true,
    coverageReporters: ['html'],
  };
  