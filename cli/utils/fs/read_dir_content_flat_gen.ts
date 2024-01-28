import type { Dirent } from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

/**
 * Read folder content with generator.
 *
 * @param directory - target folder to traverse
 * @yields next item in directory
 */
export async function* readFolderGen(directory: string): AsyncGenerator<string> {
  const folders: Array<Dirent> = await fsp.readdir(directory, { withFileTypes: true });

  for (const folder of folders) {
    const file: string = path.resolve(directory, folder.name);

    if (folder.isDirectory()) {
      yield* readFolderGen(file);
    } else {
      yield file;
    }
  }
}
