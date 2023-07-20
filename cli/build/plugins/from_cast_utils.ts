import { isIdentifier, SyntaxKind } from "typescript";
import { Plugin } from "typescript-to-lua";
import { createErrorDiagnosticFactory } from "./utils/diagnostics";

const FROM_CAST_METHODS: Array<string> = ["$fromObject", "$fromArray", "$fromLuaArray", "$fromLuaTable"];

/**
 * Push generic error to notify about usage issue.
 */
const createInvalidFunctionCallError = createErrorDiagnosticFactory((name?: string) => {
  return `Invalid transformer call, expected function to have exactly 1 argument.`;
});

/**
 * Plugin for transformation of casting methods.
 * Simplifies TS/Lua testing and interoperation.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.CallExpression]: (node, context) => {
      if (isIdentifier(node.expression) && FROM_CAST_METHODS.includes(node.expression.text)) {
        if (node.arguments.length !== 1) {
          context.diagnostics.push(createInvalidFunctionCallError(node));
        }

        return context.transformExpression(node.arguments[0]);
      }

      return context.superTransformExpression(node);
    },
  },
};

export default plugin;
