const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "../../");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  clearMocks: true,
  collectCoverage: false,
  cacheDirectory: "<rootDir>/target/jest_cache",
  coverageDirectory: "<rootDir>/target/coverage_report",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["json", "html"],
  moduleNameMapper: {
    "^#/(.*)": "<rootDir>/cli/$1",
    "^@/(.*)": "<rootDir>/src/$1",
    "^xray16$": "<rootDir>/src/fixtures/xray/mockXRay16Runtime.ts",
  },
  preset: "ts-jest",
  rootDir: ROOT_DIR,
  roots: ["<rootDir>"],
  setupFiles: [path.resolve(__dirname, "./jest_global.ts")],
  setupFilesAfterEnv: [path.resolve(__dirname, "./jest_after_env.ts")],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: path.resolve(ROOT_DIR, "src/tsconfig.json"),
      },
    ],
  },
  verbose: true,
  workerIdleMemoryLimit: "512MB",
};
