import * as fs from "fs";

import {
  ArrayBindingPattern,
  ArrowFunction,
  CallExpression,
  createSourceFile,
  ExpressionStatement,
  Identifier,
  isArrowFunction,
  isExpressionStatement,
  isStringLiteral,
  JSDoc,
  JSDocTag,
  NamedDeclaration,
  ParameterDeclaration,
  ScriptTarget,
  SourceFile,
  Statement,
  SyntaxKind,
  TupleTypeNode,
  TypeNode,
  TypeReferenceNode,
} from "typescript";

import { IExternCallbackParameterDescriptor, IExternFileDescriptor } from "#/parse/utils/types";
import { Optional } from "#/utils";

/**
 * Method name used for externals declaration.
 */
const EXTERN_METHOD_NAME: string = "extern";

/**
 * Get list of 'extern' called method metadata.
 * Collects docs/types/description of externalized methods for provided typescript files list.
 */
export function getExternDocs(files: Array<string>): Array<IExternFileDescriptor> {
  return files.map((it: string) => {
    const sourceFile: SourceFile = createSourceFile(it, fs.readFileSync(it).toString(), ScriptTarget.ESNext);
    const extern = sourceFile.statements
      .filter((it: Statement) => {
        if (!isExpressionStatement(it)) {
          return false;
        } else if (it.expression?.["expression"]?.escapedText !== EXTERN_METHOD_NAME) {
          return false;
        }

        const callExpression: CallExpression = (it as ExpressionStatement).expression as CallExpression;

        if (callExpression.arguments.length !== 2) {
          return false;
        } else if (callExpression.arguments[0] && !isStringLiteral(callExpression.arguments[0])) {
          return false;
        } else if (callExpression.arguments[1] && !isArrowFunction(callExpression.arguments[1])) {
          return false;
        }

        return true;
      })
      .map((statement: Statement) => {
        const callExpression: CallExpression = (statement as ExpressionStatement).expression as CallExpression;
        const doc: Optional<JSDoc> = statement["jsDoc"] && statement["jsDoc"][0];
        const externCallback: ArrowFunction = callExpression.arguments[1] as ArrowFunction;

        const externName: string = callExpression.arguments[0]["text"];
        let docComment: string = doc ? (doc.comment as string) : "";
        let callbackDescription: Array<IExternCallbackParameterDescriptor> = [];

        if (doc?.tags?.length) {
          docComment +=
            "\n\n" +
            doc.tags
              .map((it: JSDocTag): string => {
                const tagName: string = it.tagName.escapedText as string;
                const itemName = it["name"] ? it["name"].escapedText : null;

                return `[${tagName}] ${itemName ? itemName + " " : ""}${(it.comment as string) || ""}`;
              })
              .join("\n");
        }

        if (externCallback.parameters?.length) {
          callbackDescription = externCallback.parameters
            .map((declaration: ParameterDeclaration) => getCallbackParameterDescriptor(declaration))
            .filter(Boolean);
        }

        return { file: it, name: externName, parameters: callbackDescription, doc: docComment };
      });

    return {
      file: it,
      extern: extern,
    };
  });
}

/**
 * Get matching type label for provided AST node.
 */
function getNodeTypeLabel(node: TypeNode): string {
  switch (node.kind) {
    case SyntaxKind.NumberKeyword:
      return "number";

    case SyntaxKind.StringKeyword:
      return "string";

    case SyntaxKind.BooleanKeyword:
      return "boolean";

    case SyntaxKind.NullKeyword:
      return "null";

    case SyntaxKind.TypeReference:
      return ((node as TypeReferenceNode).typeName as Identifier)?.escapedText as string;

    case SyntaxKind.TupleType:
      return `[${(node as TupleTypeNode).elements.map((it) => getNodeTypeLabel(it)).join(", ")}]`;

    default:
      return "unknown";
  }
}

/**
 * Get parameter label for provided AST node.
 */
function getNodeName(node: NamedDeclaration): string {
  if ((node.name.kind as SyntaxKind) === SyntaxKind.ArrayBindingPattern) {
    return `[${(node.name as unknown as ArrayBindingPattern).elements
      .map((it) => getNodeName(it as unknown as ParameterDeclaration))
      .join(", ")}]`;
  } else {
    return node.name["escapedText"] as string;
  }
}

/**
 * Get descriptor of callback parameter AST node.
 */
function getCallbackParameterDescriptor(parameter: ParameterDeclaration): IExternCallbackParameterDescriptor {
  switch (parameter.type.kind) {
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.TupleType:
      return {
        parameterName: getNodeName(parameter),
        parameterTypeName: getNodeTypeLabel(parameter.type),
      };

    default:
      return {
        parameterName: getNodeName(parameter),
        parameterTypeName: ((parameter.type as TypeReferenceNode).typeName as Identifier)?.escapedText as string,
      };
  }
}
