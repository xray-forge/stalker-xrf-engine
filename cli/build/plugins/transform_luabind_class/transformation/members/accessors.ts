import { unsupportedStaticAccessor } from "../errors";
import { AccessorDeclaration } from "typescript";
import { AllAccessorDeclarations, LuaLibFeature, TransformationContext } from "typescript-to-lua";
import * as lua from "typescript-to-lua";
import { createSelfIdentifier } from "typescript-to-lua/dist/transformation/utils/lua-ast";
import { transformLuaLibFunction } from "typescript-to-lua/dist/transformation/utils/lualib";
import { transformFunctionBody, transformParameters } from "typescript-to-lua/dist/transformation/visitors/function";
import { transformPropertyName } from "typescript-to-lua/dist/transformation/visitors/literal";
import { isStaticNode } from "../utils";

function transformAccessor(context: TransformationContext, node: AccessorDeclaration): lua.FunctionExpression {
  const [params, dot, restParam] = transformParameters(context, node.parameters, createSelfIdentifier());
  const body = node.body ? transformFunctionBody(context, node.parameters, node.body, restParam)[0] : [];
  return lua.createFunctionExpression(lua.createBlock(body), params, dot, lua.NodeFlags.Declaration);
}

export function transformAccessorDeclarations(
  context: TransformationContext,
  { firstAccessor, getAccessor, setAccessor }: AllAccessorDeclarations,
  className: lua.Identifier
): lua.Statement | undefined {
  const propertyName = transformPropertyName(context, firstAccessor.name);
  const descriptor = lua.createTableExpression([]);

  if (getAccessor) {
    const getterFunction = transformAccessor(context, getAccessor);
    descriptor.fields.push(lua.createTableFieldExpression(getterFunction, lua.createStringLiteral("get")));
  }

  if (setAccessor) {
    const setterFunction = transformAccessor(context, setAccessor);
    descriptor.fields.push(lua.createTableFieldExpression(setterFunction, lua.createStringLiteral("set")));
  }

  const isStatic = isStaticNode(firstAccessor);

  if (isStatic) {
    context.diagnostics.push(unsupportedStaticAccessor(firstAccessor));
    return;
  }

  const target = lua.cloneIdentifier(className);
  const feature = LuaLibFeature.ObjectDefineProperty;
  const parameters: lua.Expression[] = [target, propertyName, descriptor];

  const call = transformLuaLibFunction(context, feature, undefined, ...parameters);
  return lua.createExpressionStatement(call);
}
