import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject, Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Save text data to the file.
 *
 * @param folderPath - target folder to save file, make sure it exists before writing to the file
 * @param filePath - target file to save data
 * @param data - target data to save
 */
export function saveTextToFile(folderPath: TPath, filePath: TPath, data: string): void {
  // Make sure target directory exists.
  lfs.mkdir(folderPath);

  const [file] = io.open(filePath, "wb");

  if (!file || io.type(file) !== "file") {
    return logger.format("Cannot write to save path: %s", filePath);
  }

  file.write(data);
  file.close();
}

/**
 * Save text data to the file.
 *
 * @param folderPath - target folder to save file, make sure it exists before writing to the file
 * @param filePath - target file to save data
 * @param data - target table data to save
 */
export function saveObjectToFile(folderPath: TPath, filePath: TPath, data: AnyObject): void {
  if (marshal === null) {
    return logger.format("Cannot save object to file,`marshal` lib is not available: %s", filePath);
  }

  return saveTextToFile(folderPath, filePath, marshal.encode(data));
}

/**
 * Read text data from the file.
 *
 * @param filePath - target path to read file
 * @returns string data from the file or null
 */
export function loadTextFromFile(filePath: TPath): Optional<string> {
  const [file] = io.open(filePath, "rb");

  if (!file || io.type(file) !== "file") {
    return null;
  }

  const data: Optional<string> = file.read("*all" as unknown as "*a") as Optional<string>;

  file.close();

  return data;
}

/**
 * Read object data from the file.
 *
 * @param filePath - target path to read file
 * @returns optional deserialized object
 */
export function loadObjectFromFile<T extends AnyObject>(filePath: TPath): Optional<T> {
  const data: Optional<string> = loadTextFromFile(filePath);

  if (marshal !== null && data !== null && data !== "") {
    return marshal.decode(data) as T;
  } else {
    return null;
  }
}
