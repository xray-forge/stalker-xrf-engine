import * as path from "path";
import { SyntaxKind } from "typescript";
import { createStringLiteral, Plugin } from "typescript-to-lua";

const FILENAME_IDENTIFIER: string = "$filename";

/**
 * Plugin that injects FILE_NAME in compile-time.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.Identifier]: (node, context) => {
      if (node.text === FILENAME_IDENTIFIER) {
        return createStringLiteral(path.parse(context.sourceFile.fileName).name);
      }

      return context.superTransformExpression(node);
    },
  },
};

export default plugin;
