import cp from "child_process";
import path from "path";

import { blue, blueBright } from "chalk";

import { default as config } from "#/config.json";
import { CLI_DIR, GAME_DATA_UI_DIR, XRF_UTILS_PATH } from "#/globals";
import { normalizeParameterPath } from "#/utils/fs/normalize_parameter_path";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("PACK_TEXTURE_DESCRIPTIONS");

export function packTextureDescriptions(): void {
  log.info(blueBright("Pack texture descriptions"));

  const timeTracker: TimeTracker = new TimeTracker().start();

  const command: string = `${XRF_UTILS_PATH} pack-texture-description --description ${path.resolve(
    GAME_DATA_UI_DIR,
    "textures_descr"
  )} --base ${path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder),
    "textures"
  )} --strict -v`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    stdio: "inherit",
  });

  log.info("Successfully executed pack descriptions command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
