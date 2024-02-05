import * as fsp from "fs/promises";
import * as path from "path";

import { TDirectoryFilesTree } from "#/utils/fs/types";

/**
 * Read contents of directory including folders and scripts.
 *
 * @param directory - path to directory to scan
 * @param isRecursive - whether scan should be recursive
 * @returns array of directory files tree
 */
export async function readDirContent(directory: string, isRecursive: boolean = true): Promise<TDirectoryFilesTree> {
  return (await Promise.all(
    (await fsp.readdir(directory, { withFileTypes: true })).map((dirent) => {
      const it: string = path.join(directory, dirent.name);

      if (isRecursive && dirent.isDirectory()) {
        return readDirContent(it);
      }

      return it;
    })
  )) as Array<string | Array<string>>;
}
