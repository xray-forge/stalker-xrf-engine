import { CallExpression, Expression, factory, isIdentifier, SuperExpression, SyntaxKind } from "typescript";
import * as tstl from "typescript-to-lua";
import { isSymbolExported } from "typescript-to-lua/dist/transformation/utils/export";
import { getCalledExpression, transformArguments } from "typescript-to-lua/dist/transformation/visitors/call";
import { transformIdentifier } from "typescript-to-lua/dist/transformation/visitors/identifier";
import { ITransformationContext } from "./class_declaration";
import { LUABIND_CONSTRUCTOR_METHOD } from "./constants";
import { isLuabindClassType } from "./utils";

/**
 * Transform generic methods super calls.
 * Example: super.parentMethod(first, second).
 */
export function transformClassSuperMethodExpression(expression: Expression, context: ITransformationContext) {
  const superInfos = context.classSuperInfos;
  const superInfo = superInfos[superInfos.length - 1];

  if (!superInfo.classDeclaration || !isLuabindClassType(superInfo.classDeclaration, context)) {
    return context.superTransformExpression(expression);
  }

  const { extendedTypeNode } = superInfo;

  // Using `super` without extended type node is a TypeScript error
  const extendsExpression = extendedTypeNode?.expression;
  let baseClassName: tstl.AssignmentLeftHandSideExpression | undefined;

  if (extendsExpression && isIdentifier(extendsExpression)) {
    const symbol = context.checker.getSymbolAtLocation(extendsExpression);
    if (symbol && !isSymbolExported(context, symbol)) {
      // Use "baseClassName" if base is a simple identifier
      baseClassName = transformIdentifier(context, extendsExpression);
    }
  }

  if (!baseClassName) {
    throw new Error("Super without identifier - not supported with luabind.");
  }

  return baseClassName;
}

/**
 * Check if super() call is in luabind class target.
 */
export function isLuabindClassSuperCall(
  expression: CallExpression | SuperExpression,
  context: ITransformationContext
): boolean {
  const calledExpression: Expression = getCalledExpression(expression as CallExpression);

  if (calledExpression.kind !== SyntaxKind.SuperKeyword) {
    return false;
  } else {
    const superInfos = context.classSuperInfos;
    const superInfo = superInfos[superInfos.length - 1];

    // Handle super calls properly for luabind classes.
    return superInfo?.classDeclaration ? isLuabindClassType(superInfo.classDeclaration, context) : false;
  }
}

/**
 * Check if super.method() call is in luabind class target.
 */
export function isLuabindClassSuperMethodCall(
  expression: CallExpression | SuperExpression,
  context: ITransformationContext
): boolean {
  const superInfos = context.classSuperInfos;
  const superInfo = superInfos[superInfos.length - 1];

  // Handle super calls properly for luabind classes.
  return superInfo?.classDeclaration ? isLuabindClassType(superInfo.classDeclaration, context) : false;
}

/**
 * Transform super() call in luabind classes to base_class.__init(self, param).
 */
export function transformLuabindConstructorSuperCall(expression: CallExpression, context: ITransformationContext) {
  const signature = context.checker.getResolvedSignature(expression);
  const parameters = transformArguments(context, expression.arguments, signature, factory.createThis());

  return tstl.createCallExpression(
    tstl.createTableIndexExpression(
      context.transformExpression(factory.createSuper()),
      tstl.createStringLiteral(LUABIND_CONSTRUCTOR_METHOD)
    ),
    parameters,
    expression
  );
}
