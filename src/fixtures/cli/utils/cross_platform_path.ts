import * as os from "node:os";
import * as path from "node:path";

/**
 * @param target - Target path to normalize to single platform.
 * @returns Normalized path.
 */
export function normalizeOSPath(target: string): string {
  return target.replaceAll(os.platform() === "win32" ? "/" : "\\", path.sep);
}
