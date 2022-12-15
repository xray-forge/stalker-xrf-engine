import * as path from "path";

export const ROOT_DIR: string = path.resolve(__dirname, "../../");
export const SRC_DIR: string = path.resolve(ROOT_DIR, "src");
export const MOD_DIR: string = path.resolve(SRC_DIR, "mod");
export const RESOURCES_DIR: string = path.resolve(MOD_DIR, "resources");

export const GAME_DATA_METADATA_FILE: string = path.resolve(MOD_DIR, "metadata.json");
export const GAME_DATA_SCRIPTS_DIR: string = path.resolve(MOD_DIR, "scripts");
export const GAME_DATA_CONFIGS_DIR: string = path.resolve(MOD_DIR, "configs");

export const TARGET_DIR: string = path.resolve(ROOT_DIR, "target");
export const TARGET_GAME_DATA_DIR: string = path.resolve(TARGET_DIR, "gamedata");
export const TARGET_GAME_DATA_METADATA_FILE: string = path.resolve(TARGET_GAME_DATA_DIR, "metadata.json");
export const TARGET_GAME_DATA_SCRIPTS_DIR: string = path.resolve(TARGET_GAME_DATA_DIR, "scripts");
export const TARGET_GAME_DATA_CONFIGS_DIR: string = path.resolve(TARGET_GAME_DATA_DIR, "configs");
