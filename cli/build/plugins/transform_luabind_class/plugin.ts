import {
  transformLuabindClassDeclaration,
  transformNewCallExpression,
  isLuabindClassSuperCall,
  transformClassSuperMethodExpression,
  transformLuabindConstructorSuperCall,
  ITransformationContext,
  isLuabindClassType,
  isLuabindDecoratedClass,
  isLuabindClassSuperMethodCall,
} from "./transformation";
import { CallExpression, NewExpression, SuperExpression, SyntaxKind } from "typescript";
import { Plugin } from "typescript-to-lua";

/**
 * Plugin that transform TS classes marked with decorator to luabind class declaration.
 */
const plugin: Plugin = {
  visitors: {
    [SyntaxKind.CallExpression]: (expression: CallExpression, context: ITransformationContext) => {
      if (isLuabindClassSuperCall(expression, context)) {
        return transformLuabindConstructorSuperCall(expression, context);
      }

      return context.superTransformExpression(expression);
    },
    [SyntaxKind.ClassDeclaration]: (declaration, context: ITransformationContext) => {
      if (isLuabindDecoratedClass(declaration)) {
        return transformLuabindClassDeclaration(declaration, context);
      }

      return context.superTransformStatements(declaration);
    },
    [SyntaxKind.NewExpression]: (expression: NewExpression, context: ITransformationContext) => {
      if (isLuabindClassType(expression, context)) {
        return transformNewCallExpression(expression, context);
      }

      return context.superTransformExpression(expression);
    },
    [SyntaxKind.SuperKeyword]: (expression: SuperExpression, context: ITransformationContext) => {
      if (isLuabindClassSuperMethodCall(expression, context)) {
        return transformClassSuperMethodExpression(expression, context);
      }

      return context.superTransformExpression(expression);
    },
  },
};

export default plugin;
