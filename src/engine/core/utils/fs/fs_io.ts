import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject, Optional, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Save text data to the file.
 *
 * @param dir - target dir to save file, make sure it exists before writing to the file
 * @param filename - target file to save data
 * @param data - target data to save
 */
export function saveTextToFile(dir: TPath, filename: TPath, data: string): void {
  // Make sure target directory exists.
  lfs.mkdir(dir);

  // todo: Correct path.join method from game engine.
  // todo: Cross platform separator with correct string ending check.
  const path: TPath = `${dir}${string.sub(dir, -1) === "\\" ? "" : "\\"}${filename}`;
  const [file] = io.open(path, "wb");

  if (!file || io.type(file) !== "file") {
    return logger.info("Cannot write to save path: '%s'", path);
  } else {
    logger.info("Saving text data: '%s'", path);
  }

  file.write(data);
  file.close();
}

/**
 * Save text data to the file.
 *
 * @param dir - target dir to save file, make sure it exists before writing to the file
 * @param filename - target file to save data
 * @param data - target table data to save
 */
export function saveObjectToFile(dir: TPath, filename: TPath, data: AnyObject): void {
  if (marshal === null) {
    return logger.info("Cannot save object to file,`marshal` lib is not available: '%s'", filename);
  } else {
    logger.info("Saving object data: '%s' - '%s'", dir, filename);
  }

  return saveTextToFile(dir, filename, marshal.encode(data));
}

/**
 * Read text data from the file.
 *
 * @param path - target path to read file
 * @returns string data from the file or null
 */
export function loadTextFromFile(path: TPath): Optional<string> {
  const [file] = io.open(path, "rb");

  if (!file || io.type(file) !== "file") {
    logger.info("Failed to read text from file: '%s'", path);

    return null;
  } else {
    logger.info("Loading text from file: '%s'", path);
  }

  const data: Optional<string> = file.read("*all" as unknown as "*a") as Optional<string>;

  file.close();

  return data;
}

/**
 * Read object data from the file.
 *
 * @param path - target path to read file
 * @returns optional deserialized object
 */
export function loadObjectFromFile<T extends AnyObject>(path: TPath): Optional<T> {
  const data: Optional<string> = loadTextFromFile(path);

  if (marshal !== null && data !== null && data !== "") {
    logger.info("Loading object data from file: '%s'", path);

    return marshal.decode(data) as T;
  } else {
    logger.info("Failed to read object data from file: '%s'", path);

    return null;
  }
}
