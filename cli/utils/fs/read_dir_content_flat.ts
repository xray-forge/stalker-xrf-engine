import * as fs from "fs/promises";
import * as path from "path";

/**
 * Read contents of directory including folders and scripts.
 */
export async function readDirContentFlat(dirPath, container: Array<string> = []): Promise<Array<string>> {
  await Promise.all(
    (
      await fs.readdir(dirPath, { withFileTypes: true })
    ).map(async (dirent) => {
      const it = path.join(dirPath, dirent.name);

      if (dirent.isDirectory()) {
        await readDirContentFlat(it, container);
      } else {
        container.push(it);
      }
    })
  );

  return container;
}
