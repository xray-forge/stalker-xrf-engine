import * as fsp from "node:fs/promises";

/**
 * Check if folder/file exists in OS.
 */
export function exists(path: string): Promise<boolean> {
  return fsp
    .access(path)
    .then(() => true)
    .catch(() => false);
}
