module.exports = {
  root: true,
  extends: "@akashic/eslint-config",
  ignorePatterns: [
    "*.js",
  ],
  parserOptions: {
    project: "tsconfig.jest.json",
    sourceType: "module"
  }
}
