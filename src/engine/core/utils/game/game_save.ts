import { bit_or, CSavedGameWrapper, FS, game, getFS, IsImportantSave, user_name } from "xray16";

import { assert } from "@/engine/core/utils/assertion";
import { loadObjectFromFile, saveObjectToFile } from "@/engine/core/utils/fs";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { gameTimeToString } from "@/engine/core/utils/game/game_time";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { roots } from "@/engine/lib/constants/roots";
import { AnyObject, FSFileListEX, Optional, SavedGameWrapper, TCount, TLabel, TName, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether save file exists with provided name.
 *
 * @param filename - target name to search in saves folder
 * @returns whether file exists
 */
export function isGameSaveFileExist(filename: TName): boolean {
  const filesList: FSFileListEX = getFS().file_list_open_ex(
    roots.gameSaves,
    bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
    filename
  );

  return filesList.Size() > 0;
}

/**
 * Delete game save file and dds file.
 *
 * @param filename - target name to delete from saves folder
 */
export function deleteGameSave(filename: TName): void {
  const saveBaseFile: TName = filename + gameConfig.GAME_SAVE_EXTENSION;
  const saveDynamicFile: TName = filename + gameConfig.GAME_SAVE_DYNAMIC_EXTENSION;
  const savePreviewFile: TName = filename + gameConfig.GAME_SAVE_PREVIEW_EXTENSION;

  const fs: FS = getFS();

  logger.info("Delete game save:", filename);

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
 * @param filename - target save filename base to create or overwrite it
 * @param data - data to save
 */
export function saveDynamicGameSave(filename: TName, data: AnyObject): void {
  const savesFolder: TPath = getFS().update_path(roots.gameSaves, "");
  const saveFile: TPath =
    savesFolder + string.lower(string.sub(filename, 0, -6)) + gameConfig.GAME_SAVE_DYNAMIC_EXTENSION;

  saveObjectToFile(savesFolder, saveFile, data);
}

/**
 * Read dynamic game save with stringified binary data.
 *
 * @param filename - target save filename full path
 * @returns stringified binary data or null
 */
export function loadDynamicGameSave<T extends AnyObject>(filename: TName): Optional<T> {
  const saveFile: TPath = string.sub(filename, 0, -6) + gameConfig.GAME_SAVE_DYNAMIC_EXTENSION;

  return loadObjectFromFile(saveFile);
}

/**
 * Get label with description for file name.
 *
 * @param filename - name of save file to check
 * @returns label with save file description
 */
export function getFileDataForGameSave(filename: TName): TLabel {
  const fileList: FSFileListEX = getFS().file_list_open_ex(
    roots.gameSaves,
    bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
    filename + gameConfig.GAME_SAVE_EXTENSION
  );
  const filesCount: TCount = fileList.Size();

  if (filesCount > 0) {
    const savedGame: SavedGameWrapper = new CSavedGameWrapper(filename);
    const dateTime: TLabel = gameTimeToString(savedGame.game_time());

    const health: TLabel = string.format(
      "\\n%s %d%s",
      game.translate_string(captions.st_ui_health_sensor),
      savedGame.actor_health() * 100,
      "%"
    );

    return string.format(
      "%s: %s\\n%s: %s%s",
      game.translate_string(captions.st_level),
      game.translate_string(savedGame.level_name()),
      game.translate_string(captions.ui_inv_time),
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
 * @param saveName - name of the file / record to save
 * @param translate - whether name should be translated
 */
export function createAutoSave(saveName: Optional<TName>, translate: boolean = true): void {
  if (IsImportantSave()) {
    createSave(saveName, translate);
  } else {
    logger.info("Skip save, auto-saving is not turned on:", saveName);
  }
}

/**
 * Save game with provided parameters.
 *
 * @param saveName - name of the file / record to save
 * @param translate - whether name should be translated
 */
export function createSave(saveName: Optional<TName>, translate: boolean = true): void {
  assert(saveName, "You are trying to use scenario save without name.");

  const saveParameter: string = user_name() + " - " + (translate ? game.translate_string(saveName) : saveName);

  logger.info("Performing save:", saveParameter);
  executeConsoleCommand(consoleCommands.save, saveParameter);
}
