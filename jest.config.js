// root jest configuration file
module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "js", "html", "json"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/*.spec.ts"],
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest",
  },
  // collectCoverage: true,
  // coverageReporters: ["html", "text-summary"],
  coverageDirectory: "<rootDir>/coverage",
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/app/$1",
  },
  rootDir: ".", // ✅ Ensures Jest resolves paths relative to the monorepo root
  testPathIgnorePatterns: ["/node_modules/", "/dist/"], // ✅ Ignore built files
  modulePathIgnorePatterns: ["/dist/"], // ✅ Ensure Jest doesn't scan the `dist/` folder

};
