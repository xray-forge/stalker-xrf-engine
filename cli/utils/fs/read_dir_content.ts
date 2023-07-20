import * as fsp from "fs/promises";
import * as path from "path";

import { TDirectoryFilesTree } from "#/utils/fs/types";

/**
 * Read contents of directory including folders and scripts.
 *
 * @param dirPath - path to directory to scan
 * @param isRecursive - whether scan should be recursive
 * @returns array of directory files tree
 */
export async function readDirContent(dirPath: string, isRecursive: boolean = true): Promise<TDirectoryFilesTree> {
  return (await Promise.all(
    (await fsp.readdir(dirPath, { withFileTypes: true })).map(async (dirent) => {
      const it: string = path.join(dirPath, dirent.name);

      if (isRecursive && dirent.isDirectory()) {
        return await readDirContent(it);
      }

      return it;
    })
  )) as Array<string | Array<string>>;
}
