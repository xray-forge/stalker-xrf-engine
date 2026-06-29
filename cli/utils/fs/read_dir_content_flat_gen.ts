import type { Dirent } from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

/**
 * Read folder content with generator.
 *
 * @param directory - Target folder to traverse.
 * @yields Next item in directory.
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
