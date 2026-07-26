import { AnyObject, Nillable, TPath } from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Save text data to the file.
 *
 * @param dir - Target dir to save file, make sure it exists before writing to the file.
 * @param filename - Target file to save data.
 * @param data - Target data to save.
 * @returns Full path written to, so callers can report it without re-joining it themselves.
 */
export function saveTextToFile(dir: TPath, filename: TPath, data: string): TPath {
  // Make sure target directory exists.
  lfs.mkdir(dir);

  // todo: Correct path.join method from game engine.
  // todo: Cross platform separator with correct string ending check.
  const path: TPath = `${dir}${string.sub(dir, -1) === "\\" ? "" : "\\"}${filename}`;
  const [file] = io.open(path, "wb");

  if (!file || io.type(file) !== "file") {
    logger.info("Cannot write to save path: '%s'", path);

    return path;
  }

  logger.info("Saving text data: '%s'", path);

  file.write(data);
  file.close();

  return path;
}

/**
 * Save text data to the file.
 *
 * @param dir - Target dir to save file, make sure it exists before writing to the file.
 * @param filename - Target file to save data.
 * @param data - Target table data to save.
 * @returns Full path written to, or null when `marshal` is unavailable and nothing was written.
 */
export function saveObjectToFile(dir: TPath, filename: TPath, data: AnyObject): Nillable<TPath> {
  if ($isNil(marshal)) {
    logger.info("Cannot save object to file,`marshal` lib is not available: '%s'", filename);

    return null;
  }

  logger.info("Saving object data: '%s' - '%s'", dir, filename);

  return saveTextToFile(dir, filename, marshal.encode(data));
}

/**
 * Read text data from the file.
 *
 * @param path - Target path to read file.
 * @returns String data from the file or null.
 */
export function loadTextFromFile(path: TPath): Nillable<string> {
  const [file] = io.open(path, "rb");

  if (!file || io.type(file) !== "file") {
    logger.info("Failed to read text from file: '%s'", path);

    return null;
  } else {
    logger.info("Loading text from file: '%s'", path);
  }

  const data: Nillable<string> = file.read("*all" as unknown as "*a") as Nillable<string>;

  file.close();

  return data;
}

/**
 * Read object data from the file.
 *
 * @param path - Target path to read file.
 * @returns Optional deserialized object.
 */
export function loadObjectFromFile<T extends AnyObject>(path: TPath): Nillable<T> {
  const data: Nillable<string> = loadTextFromFile(path);

  if ($isNotNil(marshal) && $isNotNil(data) && data !== "") {
    logger.info("Loading object data from file: '%s'", path);

    return marshal.decode(data) as T;
  } else {
    logger.info("Failed to read object data from file: '%s'", path);

    return null;
  }
}
