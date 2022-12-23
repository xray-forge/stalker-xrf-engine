import * as cp from "child_process";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("START_GAME");

(async function startGame(): Promise<void> {
  log.info("Starting game");

  const cmd: string = `"${config.targets.STALKER_GAME_FOLDER_PATH}\\${config.targets.STALKER_GAME_EXE_NAME}"`;

  log.info("Starting game exe:", chalk.blue(cmd));

  cp.exec(cmd, (error, data) => {
    log.error("Failed to start process:", error, data);
  });
})();
