import * as fsp from "node:fs/promises";

/**
 * @param path - target directory path to check
 * @returns whether provided path is directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  return (await fsp.lstat(path)).isDirectory();
}
