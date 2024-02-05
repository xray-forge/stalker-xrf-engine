import * as os from "os";
import * as path from "path";

/**
 * @param target - target path to normalize to single platform
 * @returns normalized path
 */
export function normalizeOSPath(target: string): string {
  return target.replaceAll(os.platform() === "win32" ? "/" : "\\", path.sep);
}
