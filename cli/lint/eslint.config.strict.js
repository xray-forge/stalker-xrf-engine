// @ts-check

const unusedImportsPlugin = require("eslint-plugin-unused-imports");

const baseConfig = require("./eslint.config.js");

module.exports = [
  ...baseConfig,
  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", { vars: "all", args: "after-used" }],
    },
  },
];
