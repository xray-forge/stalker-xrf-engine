import { LUABIND_NAME_FIELD } from "./constants";
import { ClassLikeDeclarationBase, isIdentifier, isVariableDeclaration } from "typescript";
import * as tstl from "typescript-to-lua";
import { TransformationContext } from "typescript-to-lua";
import {
  createDefaultExportStringLiteral,
  createExportedIdentifier,
  getIdentifierExportScope,
  hasDefaultExportModifier,
} from "typescript-to-lua/dist/transformation/utils/export";
import {
  createExportsIdentifier,
  createLocalOrExportedOrGlobalDeclaration,
} from "typescript-to-lua/dist/transformation/utils/lua-ast";
import { getExtendedNode } from "./utils";

/**
 * Create full class setup statement with name/super calls/methods/declaration/fields etc.
 */
export function createClassSetup(
  context: TransformationContext,
  statement: ClassLikeDeclarationBase,
  className: tstl.Identifier,
  localClassName: tstl.Identifier
) {
  const result: tstl.Statement[] = [];

  // class("name")(base)
  const classInitializer = createLuabindClassStatement(statement, context, localClassName);

  result.push(tstl.createExpressionStatement(classInitializer));

  const classReference = createLuabindClassGlobalClassRef(statement, context, localClassName);

  const defaultExportLeftHandSide = hasDefaultExportModifier(statement)
    ? tstl.createTableIndexExpression(createExportsIdentifier(), createDefaultExportStringLiteral(statement))
    : undefined;

  // [____exports.]className = class()
  if (defaultExportLeftHandSide) {
    result.push(tstl.createAssignmentStatement(defaultExportLeftHandSide, classReference, statement));
  } else {
    result.push(...createLocalOrExportedOrGlobalDeclaration(context, className, classReference, statement));
  }

  if (defaultExportLeftHandSide) {
    // local localClassName = ____exports.default
    result.push(tstl.createVariableDeclarationStatement(localClassName, defaultExportLeftHandSide));
  } else {
    const exportScope = getIdentifierExportScope(context, className);
    if (exportScope) {
      // local localClassName = ____exports.className
      result.push(
        tstl.createVariableDeclarationStatement(
          localClassName,
          createExportedIdentifier(context, tstl.cloneIdentifier(className), exportScope)
        )
      );
    }
  }

  // localClassName.__name = className
  result.push(
    tstl.createAssignmentStatement(
      tstl.createTableIndexExpression(
        tstl.cloneIdentifier(localClassName),
        tstl.createStringLiteral(LUABIND_NAME_FIELD)
      ),
      getReflectionClassName(statement, className),
      statement
    )
  );

  return result;
}

export function getReflectionClassName(
  declaration: ClassLikeDeclarationBase,
  className: tstl.Identifier
): tstl.Expression {
  if (declaration.name) {
    return tstl.createStringLiteral(declaration.name.text);
  } else if (isVariableDeclaration(declaration.parent) && isIdentifier(declaration.parent.name)) {
    return tstl.createStringLiteral(declaration.parent.name.text);
  } else if (hasDefaultExportModifier(declaration)) {
    return tstl.createStringLiteral("default");
  }

  if (getExtendedNode(declaration)) {
    return tstl.createTableIndexExpression(className, tstl.createStringLiteral("name"));
  }

  return tstl.createStringLiteral("");
}

/**
 * Creates class("Name")(base) expression for luabind classes.
 */
function createLuabindClassStatement(
  declaration: ClassLikeDeclarationBase,
  context: TransformationContext,
  className: tstl.Identifier
) {
  const extendedNode = getExtendedNode(declaration);

  let classDeclaration = tstl.createCallExpression(tstl.createIdentifier("class"), [
    getReflectionClassName(declaration, className),
  ]);

  if (extendedNode) {
    classDeclaration = tstl.createCallExpression(classDeclaration, [
      context.transformExpression(extendedNode.expression),
    ]);
  }

  return classDeclaration;
}

/**
 * Creates name expression for luabind classes.
 */
function createLuabindClassGlobalClassRef(
  declaration: ClassLikeDeclarationBase,
  context: TransformationContext,
  className: tstl.Identifier
) {
  return className;
}
