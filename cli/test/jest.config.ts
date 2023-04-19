// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: path.resolve(ROOT_DIR, "src/tsconfig.json"),
        isolatedModules: true,
      },
    ],
  },
  preset: "ts-jest",
  clearMocks: true,
  testEnvironment: "node",
  rootDir: ROOT_DIR,
  setupFiles: [path.resolve(__dirname, "./jest_global.ts")],
  roots: ["<rootDir>"],
  cacheDirectory: "<rootDir>/target/test/cache",
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  coverageDirectory: "<rootDir>/target/test/coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^#/(.*)": "<rootDir>/cli/$1",
    "^@/(.*)": "<rootDir>/src/$1",
  },
  verbose: true,
};
