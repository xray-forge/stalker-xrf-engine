import fsPromises from "fs/promises";

import { default as chalk } from "chalk";

import { OPEN_XRAY_ENGINES_DIR } from "#/globals";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("LIST_ENGINES");

/**
 * Print list of available engines.
 */
export async function printEnginesList(): Promise<void> {
  log.info("Available engines:");

  const engines: Array<string> = await getEnginesList();

  engines.forEach((it) => log.info("->", chalk.yellow(it)));
}

/**
 * Return list of available binaries.
 */
export async function getEnginesList(): Promise<Array<string>> {
  return await fsPromises.readdir(OPEN_XRAY_ENGINES_DIR);
}
