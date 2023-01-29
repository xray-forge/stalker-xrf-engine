/* @noSelfInFile */
/* eslint prefer-const: 0,  @typescript-eslint/no-var-requires: 0 */

import { XR_object_factory } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";

declare let register_classes: (object_factory: XR_object_factory) => void;
declare let get_game_clsid: (gameTypeOption: string, isServer: boolean) => void;
declare let get_ui_clsid: (gameType: string) => void;

const log: LuaLogger = new LuaLogger("register");

/**
 * Registration:
 */

register_classes = (...args) => {
  log.info("Register classes:");

  const { registerGameClasses } = require("@/mod/scripts/registering/class_registrator");

  registerGameClasses(...args);
};

get_game_clsid = (...args) => {
  log.info("Register clsid:");

  const { getGameClsId } = require("@/mod/scripts/registering/game_registrator");

  getGameClsId(...args);
};

get_ui_clsid = (...args) => {
  log.info("Register ui clsid:");

  const { getUiClsId } = require("@/mod/scripts/registering/ui_registrator");

  getUiClsId(...args);
};
