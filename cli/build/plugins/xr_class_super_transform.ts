import { SyntaxKind } from "typescript";
import { isCallExpression, Plugin } from "typescript-to-lua";
import { Identifier } from "typescript-to-lua/dist/LuaAST";

const super_call_expression_from: string = "xr_class_super";
const super_call_expression_to: string = "super";

/**
 * Plugin that transforms super_call_exppression calls to super.
 * Allows usage of 'super' from lua without workarounds and problems.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.CallExpression]: (node, context) => {
      const result = context.superTransformExpression(node);

      if (isCallExpression(result) && (result.expression as Identifier).text === super_call_expression_from) {
        (result.expression as Identifier).text = super_call_expression_to;
      }

      return result;
    }
  }
};

export default plugin;
