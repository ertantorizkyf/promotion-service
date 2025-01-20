// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    'node_modules', 
    'index.js',
    'tests/',
    'middlewares/',
    'repositories/',
    'models/',
    'routers/',
    'constants/',
    'helpers/encryptionHelper',
    'helpers/logHelper',
    'helpers/responseHelper',
    'helpers/authHelper'
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // Use this configuration option to add custom reporters to Jest
  reporters: ['default', 'jest-sonar'],

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // Configuration for coverage threshold
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
