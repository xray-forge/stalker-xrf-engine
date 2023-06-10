import { exec } from "child_process";

import { green, yellow } from "chalk";

import { getGamePaths, NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("START_GAME");

/**
 * Start game executable provided in config.json file.
 */
export async function startGame(): Promise<void> {
  log.info("Starting game:");

  const { app } = await getGamePaths();

  log.info("Starting game app:", yellow(app));

  exec(`"${app}"`, (error, data) => {
    if (error !== null) {
      log.error("Failed to start process:", error, data, "\n");
    } else {
      log.info("Started process:", green("OK"), "\n");
    }
  });
}
