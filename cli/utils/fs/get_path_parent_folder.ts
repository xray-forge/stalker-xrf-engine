import * as path from "path";

/**
 * Get parent folder from provided path.
 */
export function getPathParentFolder(directory: string): string {
  return path.basename(path.dirname(directory));
}
