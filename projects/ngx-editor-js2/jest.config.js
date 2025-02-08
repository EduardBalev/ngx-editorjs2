// project ngx-editor-js2 jest configuration file
module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "js", "html", "json"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/*.spec.ts"],
  transform: {
    '^.+\\.(ts|js|html)$': ['jest-preset-angular', 'ts-jest'],
  },
  coverageDirectory: "<rootDir>/coverage",
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/src/app/$1",
  },
};
