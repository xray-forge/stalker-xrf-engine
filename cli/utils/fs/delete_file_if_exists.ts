import * as fs from "fs";

/**
 * Delete file if it exists.
 */
export function deleteFileIfExists(path: string): void {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}
