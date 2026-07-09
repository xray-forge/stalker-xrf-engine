const path = require("node:path");

const xra16 = require("xray16/testing");

const ROOT_DIR = path.resolve(__dirname, "../../");

/**
 * Built on top of `xray16/testing` `createJestConfig`, which supplies the `ts-jest` preset, the `^xray16$`
 * runtime stand-in mapping, and a setup file that injects the Lua globals and bridges the `xray16` module.
 *
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = xra16.createJestConfig({
  clearMocks: true,
  collectCoverage: false,
  cacheDirectory: "<rootDir>/target/jest_cache",
  coverageDirectory: "<rootDir>/target/coverage_report",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["json", "html"],
  moduleNameMapper: {
    "^#/(.*)": "<rootDir>/cli/$1",
    "^@/(.*)": "<rootDir>/src/$1",
  },
  rootDir: ROOT_DIR,
  roots: ["<rootDir>"],
  setupFiles: [path.resolve(__dirname, "./jest_global.ts")],
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
});
