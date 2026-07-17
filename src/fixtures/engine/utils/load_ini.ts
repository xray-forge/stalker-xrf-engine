import { create_ini_file } from "xray16";
import { IniFile } from "xray16/alias";

import { readInGameTestLtx } from "@/fixtures/engine/utils/read_ltx";

const INHERITED_SECTION_PATTERN: RegExp = /^\s*\[[^\]\r\n]+\]\s*:/m;
const LTX_INCLUDE_PATTERN: RegExp = /^\s*#include\b/m;

/**
 * Load a self-contained LTX file into an engine-shaped test ini.
 *
 * The Jest `create_ini_file` mock parses one INI document only.
 * Reject unsupported constructs explicitly so a behavior test cannot accidentally observe different data from the game.
 *
 * @param file - Path to the LTX file to load.
 * @returns Parsed engine-shaped ini file.
 */
export async function loadInGameTestIni(file: string): Promise<IniFile> {
  const content: string = await readInGameTestLtx(file);

  if (LTX_INCLUDE_PATTERN.test(content)) {
    throw new Error(`Cannot load '${file}' in a behavior test: #include is not supported.`);
  }

  if (INHERITED_SECTION_PATTERN.test(content)) {
    throw new Error(`Cannot load '${file}' in a behavior test: section inheritance is not supported.`);
  }

  return create_ini_file(content);
}
