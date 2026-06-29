import * as fs from "node:fs";

/**
 * Create directory if provided path does not exist.
 *
 * @param path - System path to directory.
 * @returns Whether new directory was created.
 */
export function createDirIfNoExisting(path: string): boolean {
  if (fs.existsSync(path)) {
    return false;
  } else {
    fs.mkdirSync(path, { recursive: true });

    return true;
  }
}
