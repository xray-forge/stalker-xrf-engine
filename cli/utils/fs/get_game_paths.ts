import { isAbsolute, join, normalize } from "path";

import { getAppPath } from "steam-path";

import { default as config } from "#/config.json";

const GAME_ID = config.targets.stalker_game_steam_id;
const FALLBACK_GAME_PATH = config.targets.stalker_game_fallback_path;

const GAME_PATHS = {
  root: "",
  app: config.targets.stalker_app_path || "Stalker-COP.exe",
  logs: config.targets.stalker_logs_path || "_appdata_/logs",
  gamedata: "gamedata",
  bin: "bin",
  binXrfBackup: "bin_xrf_backup",
  binJson: "bin/bin.json",
};

type GamePaths = typeof GAME_PATHS;

export async function getGamePaths(): Promise<GamePaths> {
  const { path: gamePath } = await getAppPath(GAME_ID).catch(() => {
    if (FALLBACK_GAME_PATH) return { path: FALLBACK_GAME_PATH };

    throw new Error("No game path provided!");
  });

  return Object.entries(GAME_PATHS).reduce((paths, [name, path]) => {
    const normalPath = normalize(path);
    const isAbs = isAbsolute(normalPath);

    paths[name] = isAbs ? normalPath : join(gamePath, normalPath);

    return paths;
  }, {} as GamePaths);
}
