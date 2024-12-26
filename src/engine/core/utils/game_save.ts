import { bit_or, CSavedGameWrapper, device, FS, game, getFS, IsImportantSave, user_name } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { assert } from "@/engine/core/utils/assertion";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { loadObjectFromFile, saveObjectToFile } from "@/engine/core/utils/fs";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameTimeToString } from "@/engine/core/utils/time";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { TGameDifficulty } from "@/engine/lib/constants/game_difficulties";
import { roots } from "@/engine/lib/constants/roots";
import {
  AnyObject,
  FSFileListEX,
  FSItem,
  LuaArray,
  Optional,
  SavedGameWrapper,
  TLabel,
  TName,
  TPath,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @returns list of game saves file system items
 */
export function getGameSaves(): LuaArray<FSItem> {
  const saves: LuaArray<FSItem> = new LuaTable();
  const files: FSFileListEX = getFS().file_list_open_ex(
    roots.gameSaves,
    bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
    "*" + forgeConfig.SAVE.GAME_SAVE_EXTENSION
  );

  files.Sort(FS.FS_sort_by_modif_down);

  for (let it = 0; it < files.Size(); it += 1) {
    const file: FSItem = files.GetAt(it);

    if (file.NameFull().endsWith(forgeConfig.SAVE.GAME_SAVE_EXTENSION)) {
      table.insert(saves, file);
    }
  }

  return saves;
}

/**
 * Check whether save file exists with provided name.
 *
 * @param name - target name to search in saves folder
 * @returns whether file exists
 */
export function isGameSaveFileExist(name: TName): boolean {
  return getFS().file_list_open_ex(roots.gameSaves, bit_or(FS.FS_ListFiles, FS.FS_RootOnly), name).Size() > 0;
}

/**
 * Delete game save file and dds file.
 *
 * @param name - target name to delete from saves folder
 */
export function deleteGameSave(name: TName): void {
  const saveBaseFile: TName = name + forgeConfig.SAVE.GAME_SAVE_EXTENSION;
  const saveDynamicFile: TName = name + forgeConfig.SAVE.GAME_SAVE_DYNAMIC_EXTENSION;
  const savePreviewFile: TName = name + forgeConfig.SAVE.GAME_SAVE_PREVIEW_EXTENSION;

  const fs: FS = getFS();

  logger.info("Delete game save: %s", name);

  fs.file_delete(roots.gameSaves, saveBaseFile);

  // Delete dynamic base.
  if (isGameSaveFileExist(saveDynamicFile)) {
    fs.file_delete(roots.gameSaves, saveDynamicFile);
  }

  // Delete preview.
  if (isGameSaveFileExist(savePreviewFile)) {
    fs.file_delete(roots.gameSaves, savePreviewFile);
  }
}

/**
 * Create dynamic game save based on stringified binary data.
 *
 * @param path - target save filename base to create or overwrite it
 * @param data - data to save
 */
export function saveDynamicGameSave(path: TName, data: AnyObject): void {
  const folder: TPath = getFS().update_path(roots.gameSaves, "");
  const file: TPath = string.lower(string.sub(path, 0, -6)) + forgeConfig.SAVE.GAME_SAVE_DYNAMIC_EXTENSION;

  saveObjectToFile(folder, file, data);
}

/**
 * Read dynamic game save with stringified binary data.
 *
 * @param path - generic save file name path
 * @returns stringified binary data or null
 */
export function loadDynamicGameSave<T extends AnyObject>(path: TPath): Optional<T> {
  return loadObjectFromFile(string.sub(path, 0, -6) + forgeConfig.SAVE.GAME_SAVE_DYNAMIC_EXTENSION);
}

/**
 * Get label with description for file name.
 *
 * @param name - name of save file to check
 * @returns label with save file description
 */
export function getFileDataForGameSave(name: TName): TLabel {
  const files: FSFileListEX = getFS().file_list_open_ex(
    roots.gameSaves,
    bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
    name + forgeConfig.SAVE.GAME_SAVE_EXTENSION
  );

  if (files.Size() > 0) {
    const savedGame: SavedGameWrapper = new CSavedGameWrapper(name);
    const dateTime: TLabel = gameTimeToString(savedGame.game_time());

    const health: TLabel = string.format(
      "\\n%s %d%s",
      game.translate_string("st_ui_health_sensor"),
      savedGame.actor_health() * 100,
      "%"
    );

    return string.format(
      "%s: %s\\n%s: %s%s",
      game.translate_string("st_level"),
      game.translate_string(savedGame.level_name()),
      game.translate_string("ui_inv_time"),
      dateTime,
      health
    );
  } else {
    return "no file data";
  }
}

/**
 * Save game on some scenario moments automatically.
 *
 * @param name - name of the file / record to save
 * @param translate - whether name should be translated
 */
export function createGameAutoSave(name: Optional<TName>, translate: boolean = true): void {
  assert(name, "You are trying to use scenario save without name.");

  if (IsImportantSave()) {
    const saveName: TName = user_name() + " - " + (translate ? game.translate_string(name) : name);

    createGameSave(saveName);
  } else {
    logger.info("Skip save, auto-saving is not turned on: %s", name);
  }
}

/**
 * Save game with provided parameters.
 *
 * @param name - name of the file / record to save
 */
export function createGameSave(name: Optional<TName>): void {
  assert(name, "You are trying to save without name.");

  logger.info("Performing save: %s", name);
  executeConsoleCommand(consoleCommands.save, name);
}

/**
 * Loads last game save.
 * Closes menu if it is open.
 */
export function loadLastGameSave(): void {
  executeConsoleCommand(consoleCommands.main_menu, "off");
  executeConsoleCommand(consoleCommands.load_last_save);
}

/**
 * Loads game save by name.
 * If game is not started, initializes new world.
 *
 * @param name - name of game save to load
 */
export function loadGameSave(name: Optional<TName>): void {
  assert(name, "You are trying to load without name.");

  if (registry.simulator === null) {
    executeConsoleCommand(consoleCommands.disconnect);
    executeConsoleCommand(consoleCommands.start, string.format("server(%s/single/alife/load) client(localhost)", name));
  } else {
    executeConsoleCommand(consoleCommands.load, name);
  }
}

/**
 * Starts new single game server/save.
 *
 * @param difficulty - level of difficulty for new game, optional
 */
export function startNewGame(difficulty: Optional<TGameDifficulty> = null): void {
  if (difficulty) {
    executeConsoleCommand(consoleCommands.g_game_difficulty, difficulty);
  }

  if (registry.simulator !== null) {
    executeConsoleCommand(consoleCommands.disconnect);
  }

  device().pause(false);

  executeConsoleCommand(consoleCommands.start, "server(all/single/alife/new)", "client(localhost)");
  executeConsoleCommand(consoleCommands.main_menu, "off");
}
