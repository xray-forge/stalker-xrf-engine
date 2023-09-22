import * as fsp from "fs/promises";
import * as path from "path";

import { blue, green, yellow, yellowBright } from "chalk";

import { getEnginesList, isValidEngine } from "#/engine/list_engines";
import { OPEN_XRAY_ENGINES_DIR } from "#/globals";
import { exists, getGamePaths } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";
import { Optional } from "#/utils/types";

const log: NodeLogger = new NodeLogger("USE_ENGINE");

/**
 * Switch current game engine to provided one.
 */
export async function useEngine(target: string): Promise<void> {
  const desiredVersion: string = String(target).trim();

  if (isValidEngine(desiredVersion)) {
    const { bin, binJson, binXrfBackup } = await getGamePaths();
    const engineBinDir: string = path.resolve(OPEN_XRAY_ENGINES_DIR, desiredVersion, "bin");
    const possibleBinDescriptor: string = binJson;
    const isBinFolderExist: boolean = await exists(bin);
    const isLinkedEngine: boolean = await exists(possibleBinDescriptor);
    const oldEngine: Optional<string> = isLinkedEngine ? (await import(possibleBinDescriptor)).type : null;

    log.info("Switching engine:", blue(oldEngine || "original"), "->", blue(desiredVersion));

    if (isLinkedEngine) {
      log.info("Removing old link");
      await fsp.unlink(bin);
    } else if (isBinFolderExist) {
      log.info("Unlinked engine detected");
      await fsp.rename(bin, binXrfBackup);
      log.info("Created backup at:", yellow(binXrfBackup));
    }

    log.info("Linking:", yellow(engineBinDir), "->", yellow(bin));
    await fsp.symlink(engineBinDir, bin, "junction");

    log.info("Link result:", green("OK"), "\n");
  } else {
    log.error("Supplied unknown engine variant:", yellow(desiredVersion));
    log.error("Only following are available:");

    getEnginesList().forEach((it) => log.error("->", yellowBright(it)));
  }
}
