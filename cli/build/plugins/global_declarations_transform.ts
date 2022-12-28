import { SyntaxKind } from "typescript";
import { Plugin } from "typescript-to-lua";

const XRTS_GLOBALS: Array<string> = ["xray16"];

/**
 * Plugin that removes imports from 'global' libraries like engine typedefs.
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
