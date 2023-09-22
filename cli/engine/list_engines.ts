import * as fs from "fs";

import { yellowBright } from "chalk";

import { OPEN_XRAY_ENGINES_DIR } from "#/globals";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("LIST_ENGINES");

/**
 * Print list of available engines.
 */
export async function printEnginesList(): Promise<void> {
  log.info("Available engines:");

  const engines: Array<string> = getEnginesList();

  engines.forEach((it) => log.info("->", yellowBright(it)));
}

/**
 * Return list of available binaries.
 */
export function getEnginesList(): Array<string> {
  return fs.readdirSync(OPEN_XRAY_ENGINES_DIR);
}

/**
 * Check if engine is valid.
 */
export function isValidEngine(engine: string): boolean {
  return getEnginesList().includes(engine);
}
