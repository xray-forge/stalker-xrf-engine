import * as fsp from "fs/promises";
import * as path from "path";

/**
 * Read contents of directory including folders and scripts.
 *
 * @param dirPath - target directory path to scan
 * @param container - target container to insert results
 * @param isRecursive - whether scan should be recursive
 * @returns flat list of scanned files/directories
 */
export async function readDirContentFlat(
  dirPath: string,
  container: Array<string> = [],
  isRecursive: boolean = true
): Promise<Array<string>> {
  await Promise.all(
    (await fsp.readdir(dirPath, { withFileTypes: true })).map(async (dirent) => {
      const it: string = path.join(dirPath, dirent.name);

      if (isRecursive && dirent.isDirectory()) {
        await readDirContentFlat(it, container);
      } else {
        container.push(it);
      }
    })
  );

  return container;
}
