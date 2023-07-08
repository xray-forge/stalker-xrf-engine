import * as fsp from "fs/promises";
import * as path from "path";

/**
 * Read folder content with generator.
 *
 * @param directory - target folder to traverse
 * @yields next item in directory
 */
export async function* readFolderGen(directory: string) {
  const dirents = await fsp.readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const file = path.resolve(directory, dirent.name);

    if (dirent.isDirectory()) yield* readFolderGen(file);
    else yield file;
  }
}
