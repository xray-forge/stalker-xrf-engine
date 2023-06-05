import * as cp from "child_process";

import { green, yellow } from "chalk";

import { GAME_EXE_PATH } from "#/globals";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("START_GAME");

/**
 * Start game executable provided in config.json file.
 */
export async function startGame(): Promise<void> {
  log.info("Starting game:");

  const cmd: string = `"${GAME_EXE_PATH}"`;

  log.info("Starting game exe:", yellow(cmd));

  cp.exec(cmd, (error, data) => {
    if (error !== null) {
      log.error("Failed to start process:", error, data, "\n");
    } else {
      log.info("Started process:", green("OK"), "\n");
    }
  });
}
