import * as fsPromises from "fs/promises";

/**
 * Check if folder/file exists in OS.
 */
export async function exists(path: string): Promise<boolean> {
  return Boolean(
    await fsPromises.stat(path).catch((error) => {
      if (error.code === "ENOENT") {
        return false;
      } else {
        throw error;
      }
    })
  );
}
