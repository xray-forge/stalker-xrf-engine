import * as cp from "child_process";
import * as path from "path";

import { blue, blueBright } from "chalk";

import { default as config } from "#/config.json";
import { CLI_DIR, GAME_DATA_LTX_CONFIGS_DIR, XRF_UTILS_PATH } from "#/globals";
import { IIconsCommandParameters } from "#/icons/run";
import { normalizeParameterPath } from "#/utils/fs/normalize_parameter_path";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("PACK_EQUIPMENT_ICONS");

/**
 * Assemble DDS sprite files based on many small DDS elements.
 */
export async function packEquipmentIcons(parameters: IIconsCommandParameters): Promise<void> {
  log.info(blueBright("Unpack equipment icons:"), parameters);

  const timeTracker: TimeTracker = new TimeTracker().start();

  const command: string = `${XRF_UTILS_PATH} pack-equipment-icons --system-ltx ${path.resolve(
    GAME_DATA_LTX_CONFIGS_DIR,
    "system.ltx"
  )} --source ${path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder),
    "textures",
    "ui",
    "ui_icon_equipment"
  )} --output ${path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder),
    "textures",
    "ui",
    "ui_icon_equipment.dds"
  )}${parameters.strict ? " --strict" : ""}${parameters.verbose ? " --verbose" : ""}`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    stdio: "inherit",
  });

  log.info("Successfully executed pack icons command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
