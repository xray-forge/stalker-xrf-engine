import * as path from "path";

export const XR_ENGINE_BACKUP_DIR: string = "bin_xrts_backup";

export const ROOT_DIR: string = path.resolve(__dirname, "../../");
export const SRC_DIR: string = path.resolve(ROOT_DIR, "src");
export const MOD_DIR: string = path.resolve(SRC_DIR, "mod");
export const RESOURCES_DIR: string = path.resolve(SRC_DIR, "resources");
export const BIN_DIR: string = path.resolve(ROOT_DIR, "bin");
export const OPEN_XRAY_ENGINES_DIR: string = path.resolve(BIN_DIR, "openxray");
export const BUILD_LUA_TSCONFIG: string = path.resolve(__dirname, "./tsconfig.scripts.json");
export const CLI_CONFIG: string = path.resolve(ROOT_DIR, "cli/config.json");

export const GAME_DATA_SCRIPTS_DIR: string = path.resolve(MOD_DIR, "scripts");
export const GAME_DATA_CONFIGS_DIR: string = path.resolve(MOD_DIR, "configs");
export const GAME_DATA_TRANSLATIONS_DIR: string = path.resolve(MOD_DIR, "translations");
export const GAME_DATA_UI_DIR: string = path.resolve(MOD_DIR, "ui");

export const TARGET_DIR: string = path.resolve(ROOT_DIR, "target");
export const TARGET_LOGS_DIR: string = path.resolve(TARGET_DIR, "logs");
export const TARGET_GAME_DATA_DIR: string = path.resolve(TARGET_DIR, "gamedata");
export const TARGET_GAME_DATA_METADATA_FILE: string = path.resolve(TARGET_GAME_DATA_DIR, "metadata.json");
export const TARGET_GAME_DATA_SCRIPTS_DIR: string = path.resolve(TARGET_GAME_DATA_DIR, "scripts");
export const TARGET_GAME_DATA_CONFIGS_DIR: string = path.resolve(TARGET_GAME_DATA_DIR, "configs");
export const TARGET_GAME_DATA_UI_DIR: string = path.resolve(TARGET_GAME_DATA_CONFIGS_DIR, "ui");
export const TARGET_GAME_DATA_TRANSLATIONS_DIR: string = path.resolve(TARGET_GAME_DATA_CONFIGS_DIR, "text");

export const TARGET_PREVIEW_DIR: string = path.resolve(TARGET_DIR, "preview");
