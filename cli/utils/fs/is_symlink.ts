import * as fsp from "node:fs/promises";

/**
 * @param target - Path to check.
 * @returns Whether provided path is pointing to symlink, returns false if path does not exist.
 */
export async function isSymlink(target: string): Promise<boolean> {
  return fsp
    .lstat(target)
    .then((it) => it.isSymbolicLink())
    .catch(() => false);
}
