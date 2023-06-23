import { bit_or, CSavedGameWrapper, FS, game, getFS, IsImportantSave, user_name } from "xray16";

import { assert } from "@/engine/core/utils/assertion";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameTimeToString } from "@/engine/core/utils/time";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { roots } from "@/engine/lib/constants/roots";
import { FSFileListEX, Optional, SavedGameWrapper, TCount, TLabel, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
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
 * todo
 */
export function deleteGameSave(filename: TName): void {
  const saveFileName: TName = filename + gameConfig.GAME_SAVE_EXTENSION;
  const ddsFile: TName = filename + gameConfig.GAME_SAVE_PREVIEW_EXTENSION;

  const fs: FS = getFS();

  fs.file_delete(roots.gameSaves, saveFileName);

  if (isGameSaveFileExist(ddsFile)) {
    fs.file_delete(roots.gameSaves, ddsFile);
  }
}

/**
 * todo
 */
export function gatFileDataForGameSave(filename: TName): TLabel {
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
