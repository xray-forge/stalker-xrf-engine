/* @noSelfInFile */
/* eslint prefer-const: 0,  @typescript-eslint/no-var-requires: 0 */

import { XR_object_factory } from "xray16";

declare let register_classes: (object_factory: XR_object_factory) => void;
declare let get_game_clsid: (gameTypeOption: string, isServer: boolean) => void;
declare let get_ui_clsid: (gameType: string) => void;

/**
 * Registration:
 */

register_classes = (...args) => {
  const { registerGameClasses } = require("@/mod/scripts/registering/class_registrator");

  registerGameClasses(...args);
};

get_game_clsid = (...args) => {
  const { getGameClsId } = require("@/mod/scripts/registering/game_registrator");

  getGameClsId(...args);
};

get_ui_clsid = (...args) => {
  const { getUiClsId } = require("@/mod/scripts/registering/ui_registrator");

  getUiClsId(...args);
};
