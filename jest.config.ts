/**
 * Jest configuration for car rental booking tests
 */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/api/(.*)$': '<rootDir>/api/$1',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.test.(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/public/',
  ],
  collectCoverageFrom: [
    'lib/**/*.(ts|tsx)',
    'hooks/**/*.(ts|tsx)',
    'app/api/**/*.(ts)',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
