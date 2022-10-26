module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "./src/**/*.ts",
    "!./src/**/*/__tests__/**/*.ts"
  ],
  coverageReporters: [
    "lcov"
  ],
  coverageProvider: "v8",
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        "tsconfig": "tsconfig.jest.json"
      }
    ]
  },
  testMatch: [
    "<rootDir>/src/**/*.spec.ts"
  ],
  globalSetup: "<rootDir>/src/__tests__/setup.ts",
  globalTeardown: "<rootDir>/src/__tests__/teardown.ts"
};
