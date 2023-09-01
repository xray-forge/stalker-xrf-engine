import * as fsp from "fs/promises";

/**
 * @param dirPath - target directory path to check
 * @returns whether provided path is directory
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
  return (await fsp.lstat(dirPath)).isDirectory();
}
