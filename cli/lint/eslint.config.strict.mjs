import unusedImportsPlugin from "eslint-plugin-unused-imports";

import baseConfig from "./eslint.config.mjs";

export default [
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
