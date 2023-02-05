/* eslint prefer-const: 0,  @typescript-eslint/no-var-requires: 0 */

import { XR_object_factory } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("register");

/**
 * Registration:
 */
declare let register_classes: (object_factory: XR_object_factory) => void;
declare let get_game_clsid: (gameTypeOption: string, isServer: boolean) => void;
declare let get_ui_clsid: (gameType: string) => void;

register_classes = (object_factory) => {
  logger.info("Register classes:");

  const { registerGameClasses } = require("@/mod/scripts/registering/class_registrator");

  registerGameClasses(object_factory);
};

get_game_clsid = (gameTypeOption: string, isServer: boolean) => {
  logger.info("Register clsid:");

  const { getGameClsId } = require("@/mod/scripts/registering/game_registrator");

  getGameClsId(gameTypeOption, isServer);
};

get_ui_clsid = (gameType: string) => {
  logger.info("Register ui clsid:");

  const { getUiClsId } = require("@/mod/scripts/registering/ui_registrator");

  getUiClsId(gameType);
};
