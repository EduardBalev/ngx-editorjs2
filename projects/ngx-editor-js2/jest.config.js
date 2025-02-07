// project ngx-editor-js2 jest configuration file
module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  rootDir: "./", // ✅ Ensures Jest resolves paths inside this project
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
};
