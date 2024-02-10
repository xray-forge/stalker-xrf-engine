import * as fsp from "fs/promises";

/**
 * @param target - path to check
 * @returns whether provided path is pointing to symlink, returns false if path does not exist
 */
export async function isSymlink(target: string): Promise<boolean> {
  return fsp
    .lstat(target)
    .then((it) => it.isSymbolicLink())
    .catch(() => false);
}
