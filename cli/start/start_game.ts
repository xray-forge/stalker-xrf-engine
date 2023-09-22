import { exec } from "child_process";

import { green, yellowBright } from "chalk";

import { getGamePaths } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("START_GAME");

/**
 * Start game executable provided in config.json file.
 */
export async function startGame(): Promise<void> {
  log.info("Starting game");

  const { app } = await getGamePaths();

  log.info("Starting game app:", yellowBright(app));

  exec(`"${app}"`, (error, data) => {
    if (error !== null) {
      log.error("Failed to start process:", error, data, "\n");
    } else {
      log.info("Started process:", green("OK"), "\n");
    }
  });
}
