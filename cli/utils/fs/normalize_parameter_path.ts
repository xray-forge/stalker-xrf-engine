import * as path from "path";

/**
 * Normalize path received from outside.
 * Replace path separators from windows to current OS.
 */
export function normalizeParameterPath(externalPath: string): string {
  return externalPath.replace(/\\/g, path.sep);
}
