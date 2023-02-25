import { DiagnosticCategory, getOriginalNode, Node } from "typescript";
import { createSerialDiagnosticFactory } from "typescript-to-lua/dist/utils";

type MessageProvider<TArgs extends any[]> = string | ((...args: TArgs) => string);

const createDiagnosticFactory = <TArgs extends any[]>(category: DiagnosticCategory, message: MessageProvider<TArgs>) =>
  createSerialDiagnosticFactory((node: Node, ...args: TArgs) => ({
    file: getOriginalNode(node).getSourceFile(),
    start: getOriginalNode(node).getStart(),
    length: getOriginalNode(node).getWidth(),
    messageText: typeof message === "string" ? message : message(...args),
    category,
  }));

const createErrorDiagnosticFactory = <TArgs extends any[]>(message: MessageProvider<TArgs>) =>
  createDiagnosticFactory(DiagnosticCategory.Error, message);

export const unsupportedStaticMethod = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform static properties for luabind classes${nameReference}.`;
});

export const unsupportedClassDecorator = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform class decorators for luabind classes${nameReference}.`;
});

export const unsupportedPropertyDecorator = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform property decorator for luabind classes${nameReference}.`;
});

export const unsupportedParameterDecorator = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform parameter decorator for luabind classes${nameReference}.`;
});

export const unsupportedMethodDecorator = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform method decorator for luabind classes${nameReference}.`;
});

export const unsupportedStaticAccessor = createErrorDiagnosticFactory((name?: string) => {
  const nameReference = name ? ` '${name}'` : "";
  return `Unable transform static accessors for luabind classes${nameReference}.`;
});
