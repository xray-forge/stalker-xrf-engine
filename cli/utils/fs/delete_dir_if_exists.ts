import * as fs from "fs";

/**
 * Delete directory if it exists.
 */
export function deleteDirIfExists(path: string): boolean {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true });

    return true;
  } else {
    return false;
  }
}
