import * as cp from "node:child_process";
import * as path from "node:path";

import { green, yellowBright } from "chalk";

import { exists } from "#/utils/fs/exists";
import { getGamePaths } from "#/utils/fs/get_game_paths";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

const START_GAME_ARGUMENTS: ReadonlyArray<string> = ["-dump_bindings"];

/**
 * Start game executable provided in config.json file.
 */
export async function startGame(): Promise<void> {
  log.info("Starting game");

  const { app, bin, root } = await getGamePaths();

  const engineApp: string = path.join(bin, "xrEngine.exe");
  const startApp: string = (await exists(engineApp)) ? engineApp : app;

  log.info("Starting game app:", yellowBright(startApp), START_GAME_ARGUMENTS.join(" "));

  const game = cp.spawn(startApp, START_GAME_ARGUMENTS, {
    cwd: root,
    detached: true,
    stdio: "ignore",
  });

  game.once("error", (error: Error) => {
    log.error("Failed to start process:", error, "\n");
  });

  game.once("spawn", () => {
    game.unref();
    log.info("Started process:", green("OK"), "\n");
  });
}
