import { LUABIND_CONSTRUCTOR_METHOD } from "./constants";
import { checkLuabindClassDecoratorExpression } from "./decorators";
import { unsupportedStaticMethod } from "./errors";
import { transformAccessorDeclarations } from "./members/accessors";
import { createConstructorName, transformConstructorDeclaration } from "./members/constructor";
import { verifyPropertyDecoratingExpression, transformClassInstanceFields } from "./members/fields";
import { verifyMethodDecoratingExpression, transformMethodDeclaration } from "./members/method";
import { createClassSetup } from "./setup";
import { getExtendedNode, getExtendedType, isStaticNode, markTypeAsLuabind } from "./utils";
import {
  canHaveDecorators,
  ClassLikeDeclaration,
  ConstructorDeclaration,
  ExpressionWithTypeArguments,
  factory,
  getDecorators,
  isAccessor,
  isConstructorDeclaration,
  isMethodDeclaration,
  isPropertyDeclaration,
} from "typescript";
import * as tstl from "typescript-to-lua";
import { LuaTarget, TransformationContext } from "typescript-to-lua";
import {
  createDefaultExportExpression,
  createExportedIdentifier,
  hasDefaultExportModifier,
  hasExportModifier,
} from "typescript-to-lua/dist/transformation/utils/export";
import { createSelfIdentifier } from "typescript-to-lua/dist/transformation/utils/lua-ast";
import { transformInPrecedingStatementScope } from "typescript-to-lua/dist/transformation/utils/preceding-statements";
import { createSafeName, isUnsafeName } from "typescript-to-lua/dist/transformation/utils/safe-names";
import { transformIdentifier } from "typescript-to-lua/dist/transformation/visitors/identifier";

export interface ITransformationContext extends TransformationContext {
  classSuperInfos: Array<ClassSuperInfo>;
}

export const transformLuabindClassDeclaration = (declaration, context: TransformationContext) => {
  // If declaration is a default export, transform to export variable assignment instead
  if (hasDefaultExportModifier(declaration)) {
    // Class declaration including assignment to ____exports.default are in preceding statements
    const { precedingStatements } = transformInPrecedingStatementScope(context, () => {
      transformClassAsExpression(declaration, context as ITransformationContext);
      return [];
    });
    return precedingStatements;
  }

  const { statements } = transformClassLikeDeclaration(declaration, context as ITransformationContext);
  return statements;
};

export function transformClassAsExpression(
  expression: ClassLikeDeclaration,
  context: ITransformationContext
): tstl.Expression {
  const { statements, name } = transformClassLikeDeclaration(expression, context);
  context.addPrecedingStatements(statements);
  return name;
}

/** @internal */
export interface ClassSuperInfo {
  className: tstl.Identifier;
  classDeclaration: ClassLikeDeclaration;
  extendedTypeNode?: ExpressionWithTypeArguments;
}

export function transformClassLikeDeclaration(
  classDeclaration: ClassLikeDeclaration,
  context: ITransformationContext,
  nameOverride?: tstl.Identifier
): { statements: tstl.Statement[]; name: tstl.Identifier } {
  let className: tstl.Identifier;

  if (nameOverride !== undefined) {
    className = nameOverride;
  } else if (classDeclaration.name !== undefined) {
    className = transformIdentifier(context, classDeclaration.name);
  } else {
    className = tstl.createIdentifier(context.createTempName("class"), classDeclaration);
  }

  markTypeAsLuabind(classDeclaration, context);

  // Get type that is extended
  const extendedTypeNode = getExtendedNode(classDeclaration);
  const extendedType = getExtendedType(context, classDeclaration);

  context.classSuperInfos.push({ className, classDeclaration: classDeclaration, extendedTypeNode });

  // Get all properties with value
  const properties = classDeclaration.members.filter(isPropertyDeclaration).filter((member) => member.initializer);

  // Divide properties into static and non-static
  const instanceFields = properties.filter((prop) => !isStaticNode(prop));

  const result: tstl.Statement[] = [];

  let localClassName: tstl.Identifier;
  if (isUnsafeName(className.text, context.options)) {
    localClassName = tstl.createIdentifier(
      createSafeName(className.text),
      undefined,
      className.symbolId,
      className.text
    );
    tstl.setNodePosition(localClassName, className);
  } else {
    localClassName = className;
  }

  result.push(...createClassSetup(context, classDeclaration, className, localClassName));

  // Find first constructor with body
  const constructor = classDeclaration.members.find(
    (n): n is ConstructorDeclaration => isConstructorDeclaration(n) && n.body !== undefined
  );

  if (constructor) {
    // Add constructor plus initialization of instance fields
    const constructorResult = transformConstructorDeclaration(
      context,
      constructor,
      localClassName,
      instanceFields,
      classDeclaration
    );

    if (constructorResult) result.push(constructorResult);
  } else if (!extendedType) {
    // Generate a constructor if none was defined in a base class
    const constructorResult = transformConstructorDeclaration(
      context,
      factory.createConstructorDeclaration([], [], factory.createBlock([], true)),
      localClassName,
      instanceFields,
      classDeclaration
    );

    if (constructorResult) result.push(constructorResult);
  } else {
    // Generate a constructor if none was defined in a class with instance fields that need initialization
    // localClassName.__init = function(self, ...)
    //     baseClassName.__init(self, ...)  // or unpack(arg) for Lua 5.0
    //     ...
    // Also luabind always needs definition of call expression to use table as class.
    const constructorBody = transformClassInstanceFields(context, instanceFields);
    const argsExpression =
      context.luaTarget === LuaTarget.Lua50
        ? tstl.createCallExpression(tstl.createIdentifier("unpack"), [tstl.createArgLiteral()])
        : tstl.createDotsLiteral();
    const superCall = tstl.createExpressionStatement(
      tstl.createCallExpression(
        tstl.createTableIndexExpression(
          context.transformExpression(factory.createSuper()),
          tstl.createStringLiteral(LUABIND_CONSTRUCTOR_METHOD)
        ),
        [createSelfIdentifier(), argsExpression]
      )
    );
    constructorBody.unshift(superCall);
    const constructorFunction = tstl.createFunctionExpression(
      tstl.createBlock(constructorBody),
      [createSelfIdentifier()],
      tstl.createDotsLiteral(),
      tstl.NodeFlags.Declaration
    );
    result.push(
      tstl.createAssignmentStatement(createConstructorName(localClassName), constructorFunction, classDeclaration)
    );
  }

  // Transform accessors
  for (const member of classDeclaration.members) {
    if (!isAccessor(member)) continue;
    const accessors = context.resolver.getAllAccessorDeclarations(member);
    if (accessors.firstAccessor !== member) continue;

    const accessorsResult = transformAccessorDeclarations(context, accessors, localClassName);
    if (accessorsResult) {
      result.push(accessorsResult);
    }
  }

  const decorationStatements: tstl.Statement[] = [];

  for (const member of classDeclaration.members) {
    if (isAccessor(member)) {
      verifyPropertyDecoratingExpression(context, member);
    } else if (isMethodDeclaration(member)) {
      const statement = transformMethodDeclaration(context, member, localClassName);
      if (statement) result.push(statement);
      if (member.body) {
        verifyMethodDecoratingExpression(context, member);
      }
    } else if (isPropertyDeclaration(member)) {
      if (isStaticNode(member)) {
        context.diagnostics.push(unsupportedStaticMethod(member));
      }

      verifyPropertyDecoratingExpression(context, member);
    }
  }

  result.push(...decorationStatements);

  // Decorate the class
  if (canHaveDecorators(classDeclaration) && getDecorators(classDeclaration)) {
    getDecorators(classDeclaration)?.forEach((d) => checkLuabindClassDecoratorExpression(context, d));

    if (hasExportModifier(classDeclaration)) {
      const exportExpression = hasDefaultExportModifier(classDeclaration)
        ? createDefaultExportExpression(classDeclaration)
        : createExportedIdentifier(context, className);

      const classAssignment = tstl.createAssignmentStatement(exportExpression, localClassName);
      result.push(classAssignment);
    }
  }

  context.classSuperInfos.pop();

  return { statements: result, name: className };
}
