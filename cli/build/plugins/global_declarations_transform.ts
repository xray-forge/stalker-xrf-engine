import { SyntaxKind } from "typescript";
import { Plugin } from "typescript-to-lua";

const XRTS_GLOBALS: Array<string> = ["xray16"];

/**
 * Plugin that transforms super_call_expression calls to super.
 * Allows usage of 'super' from lua without workarounds and problems.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.ImportDeclaration]: (node, context) => {
      const module: string = node.moduleSpecifier.getText().slice(1, -1);
      const shouldNotBeTransformed: boolean = XRTS_GLOBALS.includes(module);

      if (shouldNotBeTransformed) {
        return undefined;
      }

      return context.superTransformStatements(node);
    }
  }
};

export default plugin;
