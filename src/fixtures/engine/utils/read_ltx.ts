import * as fsp from "node:fs/promises";
import * as path from "node:path";

/**
 * Read file by path and transform it to in-game LTX separated with new lines.
 *
 * @param file - Path to file.
 * @returns Promise resolving to ltx file content separated with \n.
 */
export async function readInGameTestLtx(file: string): Promise<string> {
  return (await fsp.readFile(path.resolve(file))).toString().replace(/\r\n/g, "\n");
}
