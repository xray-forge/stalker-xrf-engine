// @ts-check

const js = require("@eslint/js");
const importPlugin = require("eslint-plugin-import");
const jestPlugin = require("eslint-plugin-jest");
const jsdocPlugin = require("eslint-plugin-jsdoc");
const reactPlugin = require("eslint-plugin-react");
const sortKeysFixPlugin = require("eslint-plugin-sort-keys-fix");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["target/**", "cli/bin/**", "src/resources/**", "cli/parse/utils/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  jestPlugin.configs["flat/style"],
  jsdocPlugin.configs["flat/recommended"],
  reactPlugin.configs.flat.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "18" },
    },
    plugins: {
      "sort-keys-fix": sortKeysFixPlugin,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-misused-new": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/explicit-member-accessibility": ["error"],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "jsdoc/tag-lines": [
        "error",
        "any",
        {
          startLines: 1,
          endLines: 0,
        },
      ],
      "jsdoc/require-returns-check": "off",
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/require-yields-type": "off",
      "jsdoc/require-property-type": "off",
      "jsdoc/require-throws-type": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/no-undefined-types": "off",
      "array-element-newline": ["error", "consistent"],
      "arrow-parens": ["error", "always"],
      "arrow-spacing": "error",
      "brace-style": "error",
      camelcase: "off",
      "func-style": ["error", "declaration"],
      "no-inner-declarations": "off",
      "prefer-arrow-callback": "error",
      "sort-vars": "error",
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: false,
        },
      ],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "never",
          functions: "never",
        },
      ],
      eqeqeq: "error",
      "eol-last": ["error", "always"],
      "func-call-spacing": ["error", "never"],
      "function-paren-newline": ["error", "multiline-arguments"],
      "import/default": "off",
      "import/no-relative-parent-imports": "error",
      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: ["builtin", "external", "parent", "sibling", "index"],
          "newlines-between": "always",
          pathGroups: [
            { group: "external", pattern: "#/**", position: "after" },
            { group: "external", pattern: "@/**", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      indent: ["error", 2, { SwitchCase: 1 }],
      "key-spacing": ["error", { afterColon: true, beforeColon: false }],
      "keyword-spacing": "error",
      "max-len": ["error", { code: 120, ignorePattern: "^import\\W.*" }],
      "no-constructor-return": "error",
      "no-duplicate-imports": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 1 }],
      "no-trailing-spaces": "error",
      "object-curly-newline": ["error", { consistent: true, multiline: true }],
      "object-curly-spacing": ["error", "always"],
      "object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", next: "return", prev: "*" },
        { blankLine: "always", next: ["const", "let", "var"], prev: "expression" },
        { blankLine: "always", next: "*", prev: ["const", "let", "var"] },
        { blankLine: "always", next: "*", prev: ["for", "if", "while", "do", "with"] },
        { blankLine: "always", next: ["function", "class"], prev: ["function", "class"] },
        { blankLine: "any", next: ["const", "let", "var"], prev: ["const", "let", "var"] },
      ],
      quotes: ["error", "double"],
      "react/jsx-curly-brace-presence": [
        "error",
        {
          props: "always",
          children: "never",
          propElementValues: "always",
        },
      ],
      "react/jsx-key": "off",
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
    },
  }
);
