import {
  CallExpression,
  factory,
  Identifier,
  PropertyAccessExpression,
  SyntaxKind,
  Type,
  TypeChecker,
  VariableDeclaration,
  VariableDeclarationList
} from "typescript";
import { Plugin } from "typescript-to-lua";
import { IS_LUA_LOGGER_DISABLED } from "#/build/build";

const LUA_LOGGER_STRIP_TARGET: string = "LuaLogger";

/**
 * Plugin that removes all LuaLogger instance creations and calls when possible.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.VariableStatement]: (statement, context) => {
      if (IS_LUA_LOGGER_DISABLED) {
        let elementsCount: number = 0;
        const list = statement.declarationList as VariableDeclarationList;
        const nodes: Array<VariableDeclaration> = [];

        list.forEachChild((it: VariableDeclaration) => {
          const checker: TypeChecker = context.program.getTypeChecker();
          const typeSymbol: Type = checker.getTypeAtLocation(it);

          if (typeSymbol.symbol?.name === LUA_LOGGER_STRIP_TARGET) {
            // nothing
          } else {
            nodes.push(it);
          }

          elementsCount += 1;
        });

        if (nodes.length === 0) {
          return undefined;
        } else if (nodes.length !== elementsCount) {
          return context.superTransformStatements(
            factory.createVariableStatement(statement.modifiers, factory.updateVariableDeclarationList(list, nodes))
          );
        }
      }

      return context.superTransformStatements(statement);
    },
    [SyntaxKind.ExpressionStatement]: (statement, context) => {
      if (IS_LUA_LOGGER_DISABLED && statement.expression?.kind === SyntaxKind.CallExpression) {
        const expression: CallExpression = statement.expression as CallExpression;
        const propertyAccess: PropertyAccessExpression = expression.expression as PropertyAccessExpression;

        if (propertyAccess.expression?.kind === SyntaxKind.Identifier) {
          const checker: TypeChecker = context.program.getTypeChecker();
          const identifier: Identifier = propertyAccess.expression as Identifier;
          const typeSymbol: Type = checker.getTypeAtLocation(identifier);

          if (typeSymbol.symbol?.name === LUA_LOGGER_STRIP_TARGET) {
            return undefined;
          }
        }
      }

      return context.superTransformStatements(statement);
    }
  }
};

export default plugin;
