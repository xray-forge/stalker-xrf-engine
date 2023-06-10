import * as path from "path";

import { getAppPath } from "steam-path";

import { default as config } from "#/config.json";

const STEAM_GAME_ID: number = config.targets.stalker_game_steam_id;
const FALLBACK_GAME_PATH: string = config.targets.stalker_game_fallback_path;

const GAME_PATHS = {
  root: "",
  app: config.targets.stalker_app_path || "Stalker-COP.exe",
  logs: "_appdata_/logs",
  gamedata: "gamedata",
  bin: "bin",
  binXrfBackup: "bin_xrf_backup",
  binJson: "bin/bin.json",
};

type TGamePaths = typeof GAME_PATHS;

/**
 * Get absolute paths to the game assets/executables/directories.
 */
export async function getGamePaths(): Promise<TGamePaths> {
  const { path: gamePath } = await getAppPath(STEAM_GAME_ID).catch(() => {
    if (FALLBACK_GAME_PATH) {
      return { path: FALLBACK_GAME_PATH };
    }

    throw new Error("Steam not found and no fallback game path provided.");
  });

  return Object.entries(GAME_PATHS).reduce((paths, [name, location]) => {
    const normalPath: string = path.normalize(location);
    const isAbs: boolean = path.isAbsolute(normalPath);

    paths[name] = isAbs ? normalPath : path.join(gamePath, normalPath);

    return paths;
  }, {} as TGamePaths);
}
