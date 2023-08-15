import * as fsp from "fs/promises";
import * as path from "path";

/**
 * Read file by path and transform it to in-game LTX separated with new lines.
 *
 * @param file - path to file
 * @returns promise resolving to ltx file content separated with \n
 */
export async function readInGameTestLtx(file: string): Promise<string> {
  return (await fsp.readFile(path.resolve(file))).toString().replace(/\r\n/g, "\n");
}
