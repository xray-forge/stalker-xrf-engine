import * as os from "os";
import * as path from "path";

/**
 * @param target - target path to normalize to single platform
 * @returns normalized path
 */
export function normalizeOSPath(target: string): string {
  if (os.platform() === "win32") {
    return target.replace("/", path.sep);
  } else {
    return target.replace("\\", path.sep);
  }
}
