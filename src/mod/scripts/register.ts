import type { XR_object_factory } from "xray16";

/* eslint @typescript-eslint/no-var-requires: 0 */

/**
 * todo;
 */
registerGameClasses = (factory: XR_object_factory): void => {
  const { registerGameClasses } = require("@/mod/scripts/declarations/register/class_registrator");

  registerGameClasses(factory);
};

/**
 * todo;
 */
getGameClassId = (gameTypeOption: string, isServer: boolean): void => {
  const { getGameClassId } = require("@/mod/scripts/declarations/register/game_registrator");

  getGameClassId(gameTypeOption, isServer);
};

/**
 * todo;
 */
getUiClassId = (gameType: string): void => {
  const { getUiClassId } = require("@/mod/scripts/declarations/register/ui_registrator");

  getUiClassId(gameType);
};
