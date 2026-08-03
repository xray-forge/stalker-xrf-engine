import * as fs from "node:fs";
import * as path from "node:path";

import {
  CallExpression,
  createSourceFile,
  createProgram,
  Expression,
  ExpressionStatement,
  isArrowFunction,
  isCallExpression,
  isExpressionStatement,
  isIdentifier,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isStringLiteral,
  JSDoc,
  JSDocTag,
  Node,
  ParameterDeclaration,
  Program,
  PropertyAssignment,
  ScriptTarget,
  Signature,
  SourceFile,
  TypeChecker,
  TypeFormatFlags,
} from "typescript";

import {
  IExternCallbackParameterDescriptor,
  IExternDocumentation,
  IExternFileDescriptor,
  IExternFunction,
} from "#/parse/utils/types";
import { AnyObject, Optional } from "#/utils/types";

const EXTERN_METHOD_NAME: string = "extern";

interface IExternParserOptions {
  strict?: boolean;
}

interface IParsedExternDocumentation {
  legacy: string;
  parameters: Record<string, string>;
  value?: IExternDocumentation;
}

/**
 * Get list of extern declarations for the provided TypeScript files.
 *
 * @param files - Source files to inspect.
 * @param options - Parser behavior options.
 * @returns Parsed callable and value declarations.
 */
export function getExternDeclarations(
  files: Array<string>,
  options: IExternParserOptions = {}
): Array<IExternFileDescriptor> {
  const program: Program = createProgram(files, {
    baseUrl: process.cwd(),
    moduleResolution: 2,
    paths: {
      "#/*": ["cli/*"],
      "@/*": ["src/*"],
    },
    target: ScriptTarget.ESNext,
  });
  const checker: TypeChecker = program.getTypeChecker();

  return files.map((file: string) => {
    const sourceFile: SourceFile =
      program.getSourceFile(file) ?? createSourceFile(file, fs.readFileSync(file).toString(), ScriptTarget.ESNext);
    const extern: Array<IExternFunction> = [];

    sourceFile.statements.forEach((statement) => {
      if (!isExpressionStatement(statement) || !isExternCall(statement.expression)) {
        return;
      }

      extern.push(
        ...parseExternCall(statement, checker, options.strict ?? false).map((declaration: IExternFunction) => ({
          ...declaration,
          file,
        }))
      );
    });

    return { file, extern };
  });
}

/**
 * Get list of externalized methods for the existing documentation renderer.
 *
 * @param files - Source files to inspect.
 * @returns Parsed declaration descriptors.
 */
export function getExternDocs(files: Array<string>): Array<IExternFileDescriptor> {
  return getExternDeclarations(files).map((descriptor: IExternFileDescriptor) => ({
    ...descriptor,
    extern: descriptor.extern
      .filter((it: IExternFunction) => it.parameters !== undefined)
      .map(({ documentation: _, returnTypeName: __, parameters, ...it }: IExternFunction): IExternFunction => ({
        ...it,
        parameters: parameters?.map(({ doc: ___, ...parameter }: IExternCallbackParameterDescriptor) => parameter),
      })),
  }));
}

function isExternCall(expression: Expression): expression is CallExpression {
  return (
    isCallExpression(expression) &&
    isIdentifier(expression.expression) &&
    expression.expression.text === EXTERN_METHOD_NAME
  );
}

function parseExternCall(
  statement: ExpressionStatement,
  checker: TypeChecker,
  strict: boolean
): Array<IExternFunction> {
  const call: CallExpression = statement.expression as CallExpression;

  if (call.arguments.length !== 2 || !isStringLiteral(call.arguments[0])) {
    return failOrSkip(statement, strict, "expected a literal name and one exported value");
  }

  const externName: string = call.arguments[0].text;
  const value: Expression = call.arguments[1];
  const documentation: Optional<IParsedExternDocumentation> = getDocumentation(statement);

  if (isArrowFunction(value)) {
    return [createFunctionDescriptor(externName, value, statement.getSourceFile(), checker, documentation)];
  }

  if (isObjectLiteralExpression(value)) {
    return value.properties.flatMap((property) => {
      if (!isPropertyAssignment(property)) {
        return failOrSkip(property, strict, "expected an object property assignment");
      }

      const name: Optional<string> = getPropertyName(property);

      if (!name) {
        return failOrSkip(property, strict, "expected a literal object property name");
      }

      const propertyDocumentation: Optional<IParsedExternDocumentation> = getDocumentation(property) ?? documentation;

      return createValueDescriptor(
        `${externName}.${name}`,
        property.initializer,
        statement.getSourceFile(),
        checker,
        propertyDocumentation
      );
    });
  }

  return [createValueDescriptor(externName, value, statement.getSourceFile(), checker, documentation)];
}

function createValueDescriptor(
  name: string,
  value: Expression,
  sourceFile: SourceFile,
  checker: TypeChecker,
  documentation: Optional<IParsedExternDocumentation>
): IExternFunction {
  const signatures: ReadonlyArray<Signature> = checker.getTypeAtLocation(value).getCallSignatures();

  if (signatures.length > 0) {
    return createFunctionDescriptor(name, value, sourceFile, checker, documentation, signatures[0]);
  }

  return {
    doc: documentation?.legacy ?? "",
    ...(documentation?.value ? { documentation: documentation.value } : {}),
    file: sourceFile.fileName,
    name,
    typeName: checker.typeToString(checker.getTypeAtLocation(value), value, TypeFormatFlags.NoTruncation),
  };
}

function createFunctionDescriptor(
  name: string,
  value: Expression,
  sourceFile: SourceFile,
  checker: TypeChecker,
  documentation: Optional<IParsedExternDocumentation>,
  providedSignature?: Signature
): IExternFunction {
  const signature: Optional<Signature> =
    providedSignature ?? checker.getSignatureFromDeclaration(value as never) ?? null;

  if (!signature) {
    throw new Error(`Cannot resolve callable extern '${name}' in ${sourceFile.fileName}.`);
  }

  const declaration: Optional<Node> = signature.getDeclaration();
  const parameters: Array<IExternCallbackParameterDescriptor> = (declaration as AnyObject)?.parameters
    ? (declaration as AnyObject).parameters.map((it: ParameterDeclaration) =>
        getParameterDescriptor(it, sourceFile, checker, documentation?.parameters)
      )
    : signature.getParameters().map((symbol) => {
        const parameterDeclaration: Optional<ParameterDeclaration> =
          symbol.valueDeclaration as Optional<ParameterDeclaration>;

        if (!parameterDeclaration) {
          throw new Error(`Cannot resolve parameter for callable extern '${name}' in ${sourceFile.fileName}.`);
        }

        return getParameterDescriptor(
          parameterDeclaration,
          parameterDeclaration.getSourceFile(),
          checker,
          documentation?.parameters
        );
      });
  const returnTypeName: string =
    isArrowFunction(value) && value.type
      ? value.type.getText(sourceFile)
      : checker.typeToString(checker.getReturnTypeOfSignature(signature), value, TypeFormatFlags.NoTruncation);

  return {
    doc: documentation?.legacy ?? "",
    ...(documentation?.value ? { documentation: documentation.value } : {}),
    file: sourceFile.fileName,
    name,
    parameters,
    returnTypeName,
  };
}

function getPropertyName(property: PropertyAssignment): Optional<string> {
  return isIdentifier(property.name) || isStringLiteral(property.name) ? property.name.text : null;
}

function getParameterDescriptor(
  parameter: ParameterDeclaration,
  sourceFile: SourceFile,
  checker: TypeChecker,
  parameterDocumentation?: Record<string, string>
): IExternCallbackParameterDescriptor {
  const name: string = parameter.name.getText(sourceFile);
  const type: string = parameter.type
    ? parameter.type.getText(sourceFile)
    : checker.typeToString(checker.getTypeAtLocation(parameter), parameter, TypeFormatFlags.NoTruncation);
  const documentation: Optional<string> = parameterDocumentation?.[name] ?? null;

  return {
    ...(documentation ? { doc: documentation } : {}),
    ...(parameter.questionToken || parameter.initializer ? { optional: true } : {}),
    parameterName: name,
    parameterTypeName: type,
  };
}

function getDocumentation(node: Node): Optional<IParsedExternDocumentation> {
  const jsDoc: Optional<JSDoc> = (node as AnyObject).jsDoc?.[0];

  if (!jsDoc) {
    return null;
  }

  const description: Optional<string> = getComment(jsDoc.comment);
  const parameters: Record<string, string> = {};
  const tags: Array<JSDocTag> = [...(jsDoc.tags ?? [])];
  const returns: Optional<string> =
    tags
      .filter((tag: JSDocTag) => tag.tagName.text === "returns")
      .map((tag: JSDocTag) => normalizeDocComment(getComment(tag.comment)))
      .find(Boolean) ?? null;

  tags.forEach((tag: JSDocTag) => {
    const name: Optional<string> = (tag as AnyObject).name?.text ?? null;
    const comment: Optional<string> = normalizeDocComment(getComment(tag.comment));

    if (tag.tagName.text === "param" && name && comment) {
      parameters[name] = comment;
    }
  });

  const legacyTags: Array<string> = tags.map((tag: JSDocTag): string => {
    const name: Optional<string> = (tag as AnyObject).name?.text ?? null;
    const comment: Optional<string> = getComment(tag.comment);

    return `[${tag.tagName.text}] ${name ? `${name} ` : ""}${comment ?? ""}`;
  });
  const legacy: string = [description, legacyTags.length ? legacyTags.join("\n") : null].filter(Boolean).join("\n\n");
  const value: Optional<IExternDocumentation> =
    description || returns ? { ...(description ? { description } : {}), ...(returns ? { returns } : {}) } : null;

  return { legacy, parameters, ...(value ? { value } : {}) };
}

function getComment(comment: unknown): Optional<string> {
  return typeof comment === "string" && comment.trim() ? comment.trim() : null;
}

function normalizeDocComment(comment: Optional<string>): Optional<string> {
  return comment ? comment.replace(/^-\s*/, "") : null;
}

function failOrSkip(node: Node, strict: boolean, reason: string): Array<IExternFunction> {
  if (strict) {
    const sourceFile: SourceFile = node.getSourceFile();
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));

    throw new Error(
      `Unsupported extern declaration at ${path.basename(sourceFile.fileName)}:${position.line + 1}:${position.character + 1}, ${reason}.`
    );
  }

  return [];
}
