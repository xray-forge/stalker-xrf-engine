/* eslint prefer-const: 0,  @typescript-eslint/no-var-requires: 0 */

import type { XR_object_factory } from "xray16";

/**
 * Registration:
 */
declare let register_classes: (objectFactory: XR_object_factory) => void;
declare let get_game_clsid: (gameTypeOption: string, isServer: boolean) => void;
declare let get_ui_clsid: (gameType: string) => void;

register_classes = (object_factory) => {
  const { registerGameClasses } = require("@/mod/scripts/globals/registering/class_registrator");

  registerGameClasses(object_factory);
};

get_game_clsid = (gameTypeOption: string, isServer: boolean) => {
  const { getGameClsId } = require("@/mod/scripts/globals/registering/game_registrator");

  getGameClsId(gameTypeOption, isServer);
};

get_ui_clsid = (gameType: string) => {
  const { getUiClsId } = require("@/mod/scripts/globals/registering/ui_registrator");

  getUiClsId(gameType);
};
