import * as fs from "fs/promises";
import * as path from "path";

import { TDirectoryFilesTree } from "#/utils/fs/types";

/**
 * Read contents of directory including folders and scripts.
 */
export async function readDirContent(dirPath): Promise<TDirectoryFilesTree> {
  return (await Promise.all(
    (
      await fs.readdir(dirPath, { withFileTypes: true })
    ).map(async (dirent) => {
      const it = path.join(dirPath, dirent.name);

      return dirent.isDirectory() ? await readDirContent(it) : it;
    })
  )) as Array<string | Array<string>>;
}
