import { isStaticNode } from "../utils";
import { unsupportedMethodDecorator, unsupportedParameterDecorator, unsupportedStaticMethod } from "../errors";
import { AccessorDeclaration, getDecorators, MethodDeclaration, PropertyDeclaration } from "typescript";
import { TransformationContext } from "typescript-to-lua";
import * as lua from "typescript-to-lua";
import { transformFunctionToExpression } from "typescript-to-lua/dist/transformation/visitors/function";
import { transformPropertyName } from "typescript-to-lua/dist/transformation/visitors/literal";

export function transformMemberExpressionOwnerName(
  node: PropertyDeclaration | MethodDeclaration | AccessorDeclaration,
  className: lua.Identifier
): lua.Expression {
  return lua.cloneIdentifier(className);
}

export function transformMethodName(context: TransformationContext, node: MethodDeclaration): lua.Expression {
  const methodName = transformPropertyName(context, node.name);
  if (lua.isStringLiteral(methodName) && methodName.value === "toString") {
    return lua.createStringLiteral("__tostring", node.name);
  }
  return methodName;
}

export function transformMethodDeclaration(
  context: TransformationContext,
  node: MethodDeclaration,
  className: lua.Identifier
): lua.Statement | undefined {
  // Don't transform methods without body (overload declarations)
  if (!node.body) return;

  // Don't transform static methods for luabind classes.
  if (isStaticNode(node)) {
    context.diagnostics.push(unsupportedStaticMethod(node));
    return;
  }

  const methodTable = transformMemberExpressionOwnerName(node, className);
  const methodName = transformMethodName(context, node);
  const [functionExpression] = transformFunctionToExpression(context, node);

  return lua.createAssignmentStatement(
    lua.createTableIndexExpression(methodTable, methodName),
    functionExpression,
    node
  );
}

/**
 * Verify that method statement is not using decorators for methods/parameters.
 */
export function verifyMethodDecoratingExpression(context: TransformationContext, node: MethodDeclaration): void {
  node.parameters.flatMap((parameter, index) => {
    const decorators = getDecorators(parameter);

    if (decorators?.length) {
      decorators.forEach((decorator) => {
        context.diagnostics.push(unsupportedParameterDecorator(decorator));
      });
    }
  });

  const decorators = getDecorators(node);

  if (decorators?.length) {
    decorators.forEach((decorator) => {
      context.diagnostics.push(unsupportedMethodDecorator(decorator));
    });
  }
}
