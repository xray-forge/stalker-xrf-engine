import * as os from "os";
import * as path from "path";

/**
 * Check if both paths are pointing to the same place.
 */
export function isSamePath(first: string, second: string): boolean {
  const firstResolved: string = path.resolve(first);
  const secondResolved: string = path.resolve(second);

  // Respect win32 case insensetive checks.
  if (os.platform() === "win32") {
    return firstResolved.toLowerCase() === secondResolved.toLowerCase();
  }

  return firstResolved === secondResolved;
}
