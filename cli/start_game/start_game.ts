import * as cp from "child_process";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("START_GAME");

(async function startGame(): Promise<void> {
  log.info("Starting game");

  const params: string = "";
  const cmd: string = `"${config.targets.STALKER_GAME_FOLDER_PATH}\\${config.targets.STALKER_GAME_EXE_NAME}" ${params}`;

  log.info("Starting game exe:", chalk.yellow(cmd));

  cp.exec(cmd, (error, data) => {
    if (error !== null) {
      log.error("Failed to start process:", error, data, "\n");
    } else {
      log.info("Started process:", chalk.green("OK"), "\n");
    }
  });
})();
