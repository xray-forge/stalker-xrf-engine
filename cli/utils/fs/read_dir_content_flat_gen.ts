import fsp from "fs/promises";
import path from "path";

export async function* readFolderGen(directory: string) {
  const dirents = await fsp.readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const file = path.resolve(directory, dirent.name);

    if (dirent.isDirectory()) yield* readFolderGen(file);
    else yield file;
  }
}
