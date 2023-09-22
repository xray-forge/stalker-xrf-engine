import * as path from "path";

import { getAppPath } from "steam-path";

import { default as config } from "#/config.json";
import { exists } from "#/utils/fs/exists";

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
 * todo: Memoize paths?
 */
export async function getGamePaths(): Promise<TGamePaths> {
  const { path: gamePath } = await getAppPath(config.targets.stalker_game_steam_id).catch(() => {
    return { path: config.targets.stalker_game_fallback_path };
  });

  if (!(await exists(gamePath))) {
    throw new Error(`Suggested game path does not exist: '${gamePath}'.`);
  }

  return Object.entries(GAME_PATHS).reduce((paths, [name, location]) => {
    const normalPath: string = path.normalize(location);
    const isAbsolute: boolean = path.isAbsolute(normalPath);

    paths[name] = isAbsolute ? normalPath : path.join(gamePath, normalPath);

    return paths;
  }, {} as TGamePaths);
}
