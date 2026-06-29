import * as fsp from "node:fs/promises";
import * as path from "node:path";

/**
 * Read contents of directory including folders and scripts.
 *
 * @param dirPath - Target directory path to scan.
 * @param container - Target container to insert results.
 * @param isRecursive - Whether scan should be recursive.
 * @returns Flat list of scanned files/directories.
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
