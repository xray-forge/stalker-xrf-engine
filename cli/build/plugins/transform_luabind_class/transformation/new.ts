import { ITransformationContext } from "./index";
import { NewExpression } from "typescript";
import * as tstl from "typescript-to-lua";
import { transformArguments } from "typescript-to-lua/dist/transformation/visitors/call";

/**
 * Transform new call for luabind class as ClassConstructor() instead of TS_NEW from tstl.
 */
export function transformNewCallExpression(expression: NewExpression, context: ITransformationContext) {
  return tstl.createCallExpression(
    context.transformExpression(expression.expression),
    transformArguments(context, expression.arguments ?? [])
  );
}
