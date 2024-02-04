import * as path from "path";

/**
 * Normalize path received from outside.
 * If it is windows relative path, replace path separators.
 */
export function normalizeParameterPath(externalPath: string): string {
  if (externalPath.startsWith(".\\") || externalPath.startsWith("..\\")) {
    return externalPath.replace(/\\/g, path.sep);
  } else {
    return externalPath;
  }
}
