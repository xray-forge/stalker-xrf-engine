import * as fs from "node:fs";

/**
 * Delete file if it exists.
 */
export function deleteFileIfExists(path: string): void {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}
