import { createErrorDiagnosticFactory } from "../../utils/diagnostics";

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
