import * as fsPromises from "fs/promises";
import { FileHandle } from "fs/promises";

import { exists } from "#/utils/fs/exists";
import { Optional } from "#/utils/types";

const NEW_LINE_CHARACTERS: Array<string> = ["\n"];

/**
 * Read last lines of some text file in a streamed way.
 *
 * @param filePath - full path to read file
 * @param maxLineCount - number of lines to read from EOF
 * @param encoding - encoding to use when reading file as text
 * @returns last lines of text file
 */
export async function readLastLinesOfFile(
  filePath: string,
  maxLineCount: number,
  encoding: BufferEncoding = "utf8"
): Promise<string> {
  let file: Optional<FileHandle> = null;

  if (await exists(filePath)) {
    try {
      const stat = await fsPromises.stat(filePath);

      file = await fsPromises.open(filePath, "r");

      let chars: number = 0;
      let lineCount: number = 0;
      let lines: string = "";

      const readTillNotStart = async function () {
        if (lines.length > stat.size) {
          lines = lines.substring(lines.length - stat.size);
        }

        if (lines.length >= stat.size || lineCount >= maxLineCount) {
          if (NEW_LINE_CHARACTERS.includes(lines[0])) {
            lines = lines.substring(1);
          }

          file.close();

          return Buffer.from(lines, "binary").toString(encoding);
        }

        const result = await file.read(Buffer.alloc(1), 0, 1, stat.size - 1 - chars);
        const nextCharacter = String.fromCharCode(result.buffer[0]);

        lines = nextCharacter + lines;
        if (NEW_LINE_CHARACTERS.includes(nextCharacter) && lines.length > 1) {
          lineCount++;
        }

        chars++;

        return readTillNotStart();
      };

      return await readTillNotStart();
    } catch (reason) {
      if (file) {
        await file.close();
      }

      throw reason;
    }
  } else {
    throw new Error("File does not exist");
  }
}
