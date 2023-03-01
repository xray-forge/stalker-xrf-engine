import { LUABIND_DECORATOR, LUABIND_SYMBOL } from "./constants";
import {
  ClassLikeDeclaration,
  ClassLikeDeclarationBase,
  Expression,
  ExpressionWithTypeArguments,
  getDecorators,
  HasModifiers,
  HeritageClause,
  SyntaxKind,
  Type,
} from "typescript";
import { TransformationContext } from "typescript-to-lua";

/**
 * Whether method / field is static.
 */
export function isStaticNode(node: HasModifiers): boolean {
  return node.modifiers?.some((m) => m.kind === SyntaxKind.StaticKeyword) === true;
}

/**
 * Get class extends node.
 */
export function getExtendsClause(node: ClassLikeDeclarationBase): HeritageClause | undefined {
  return node.heritageClauses?.find((clause) => clause.token === SyntaxKind.ExtendsKeyword);
}

/**
 * Get class extended node.
 */
export function getExtendedNode(node: ClassLikeDeclarationBase): ExpressionWithTypeArguments | undefined {
  const extendsClause = getExtendsClause(node);
  if (!extendsClause) return;

  return extendsClause.types[0];
}

/**
 * Get class extended node.
 */
export function getExtendedType(context: TransformationContext, node: ClassLikeDeclarationBase): Type | undefined {
  const extendedNode = getExtendedNode(node);
  return extendedNode && context.checker.getTypeAtLocation(extendedNode);
}

/**
 * Check if class is decorated with provided decorator name.
 */
export function isLuabindDecoratedClass(declaration: ClassLikeDeclaration): boolean {
  const decorators = getDecorators(declaration);

  if (!decorators) {
    return false;
  }

  return decorators.some((it) => (it.expression as unknown as any).expression?.escapedText === LUABIND_DECORATOR);
}

/**
 * Mark provided class as Luabind target.
 */
export function markTypeAsLuabind(declaration: ClassLikeDeclaration, context: TransformationContext): void {
  const typeAtLocation = context.checker.getTypeAtLocation(declaration);
  const typeSymbol = typeAtLocation.symbol || typeAtLocation.aliasSymbol;

  (typeSymbol as {})[LUABIND_SYMBOL] = true;
}

/**
 * Check if provided class is specified as LuaBind.
 */
export function isLuabindClassType(
  declaration: Expression | ClassLikeDeclaration,
  context: TransformationContext
): boolean {
  const typeAtLocation = context.checker.getTypeAtLocation(declaration);
  const typeSymbol = typeAtLocation.symbol || typeAtLocation.aliasSymbol;

  if (typeSymbol) {
    const isMarked = (typeSymbol as {})[LUABIND_SYMBOL] === true;
    if (isMarked) {
      return true;
    } else {
      return isLuabindDecoratedClass(typeSymbol.declarations[0] as ClassLikeDeclaration);
    }
  } else {
    return false;
  }
}
