import * as fs from "fs/promises";
import * as path from "path";

/**
 * Read contents of directory including folders and scripts.
 */
export async function readDirContent(dirPath): Promise<Array<string | Array<string>>> {
  return (await Promise.all(
    (
      await fs.readdir(dirPath, { withFileTypes: true })
    ).map(async (dirent) => {
      const it = path.join(dirPath, dirent.name);

      return dirent.isDirectory() ? await readDirContent(it) : it;
    })
  )) as Array<string | Array<string>>;
}
