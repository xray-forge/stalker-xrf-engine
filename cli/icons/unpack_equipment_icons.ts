import * as cp from "child_process";
import * as path from "path";

import { blue, blueBright } from "chalk";

import { default as config } from "#/config.json";
import { CLI_DIR, GAME_DATA_LTX_CONFIGS_DIR, XRF_UTILS_PATH } from "#/globals";
import { normalizeParameterPath } from "#/utils/fs/normalize_parameter_path";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("UNPACK_EQUIPMENT_ICONS");

/**
 * Disassemble DDS sprite files based on many small DDS elements.
 */
export async function unpackEquipmentIcons(): Promise<void> {
  log.info(blueBright("Unpack equipment icons"));

  const timeTracker: TimeTracker = new TimeTracker().start();

  const command: string = `${XRF_UTILS_PATH} unpack-equipment-icons --system-ltx ${path.resolve(
    GAME_DATA_LTX_CONFIGS_DIR,
    "system.ltx"
  )} --source ${path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder),
    "textures",
    "ui",
    "ui_icon_equipment.dds"
  )} --output ${path.resolve(
    CLI_DIR,
    normalizeParameterPath(config.resources.mod_assets_base_folder),
    "textures",
    "ui",
    "ui_icon_equipment"
  )}`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    stdio: "inherit",
  });

  log.info("Successfully executed unpack icons command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
