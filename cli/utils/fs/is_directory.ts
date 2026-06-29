import * as fsp from "node:fs/promises";

/**
 * @param path - Target directory path to check.
 * @returns Whether provided path is directory.
 */
export async function isDirectory(path: string): Promise<boolean> {
  return (await fsp.lstat(path)).isDirectory();
}
