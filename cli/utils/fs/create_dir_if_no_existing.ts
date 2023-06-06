import * as fs from "fs";

/**
 * Create directory if provided path does not exist.
 */
export function createDirIfNoExisting(path: string): boolean {
  if (fs.existsSync(path)) {
    return false;
  } else {
    fs.mkdirSync(path, { recursive: true });

    return true;
  }
}
