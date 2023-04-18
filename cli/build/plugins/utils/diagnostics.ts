import { DiagnosticCategory, getOriginalNode, Node } from "typescript";
import { createSerialDiagnosticFactory } from "typescript-to-lua/dist/utils";

type MessageProvider<TArgs extends any[]> = string | ((...args: TArgs) => string);

/**
 * Create diagnostics factory to push errors when transpile lua to typescript.
 */
export function createDiagnosticFactory<TArgs extends any[]>(
  category: DiagnosticCategory,
  message: MessageProvider<TArgs>
) {
  return createSerialDiagnosticFactory((node: Node, ...args: TArgs) => ({
    file: getOriginalNode(node).getSourceFile(),
    start: getOriginalNode(node).getStart(),
    length: getOriginalNode(node).getWidth(),
    messageText: typeof message === "string" ? message : message(...args),
    category,
  }));
}

export function createErrorDiagnosticFactory<TArgs extends any[]>(message: MessageProvider<TArgs>) {
  return createDiagnosticFactory(DiagnosticCategory.Error, message);
}
