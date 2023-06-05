import * as path from "path";

/**
 * Get parent folder from provided path.
 */
export function getPathParentFolder(directory: string): string {
  // Normalize win32 base to omit disk name from path root.
  if (/^[A-Z]:\\.+/.test(directory)) {
    directory = directory.slice(2);
  }

  return path.dirname(directory.replaceAll(path.win32.sep, path.posix.sep)).split(path.posix.sep).pop();
}
