import * as fs from "fs";

/**
 * Create directory if provided path does not exist.
 */
export function createDirIfNoExisting(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}
