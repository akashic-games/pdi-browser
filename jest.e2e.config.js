module.exports = {
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        "tsconfig": "tsconfig.jest.json"
      }
    ]
  },
  testMatch: [
    "<rootDir>/e2e/**/*.spec.ts"
  ],
  globalSetup: "<rootDir>/e2e/setup.ts",
  globalTeardown: "<rootDir>/e2e/teardown.ts",
  testEnvironment: "<rootDir>/e2e/puppeteer_environment.js"
};
