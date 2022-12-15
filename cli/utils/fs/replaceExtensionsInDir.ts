import * as fsPromises from "fs/promises";
import * as path from "path";

/**
 * Read contents of directory and renames all lua scripts to .script.
 */
export async function replaceExtensionsInDir(dirPath: string, fromExt: string, toExt: string): Promise<void> {
  (await Promise.all(
    (
      await fsPromises.readdir(dirPath, { withFileTypes: true })
    ).map(async (dirent) => {
      const it = path.join(dirPath, dirent.name);

      if (dirent.isDirectory()) {
        await replaceExtensionsInDir(it, fromExt, toExt);
      } else if (it.endsWith(".lua")) {
        // eslint-disable-next-line  no-useless-escape
        await fsPromises.rename(it, it.replace(new RegExp(`\.${fromExt}$`), `.${toExt}`));
      }
    })
  ));
}
