import type { XR_object_factory } from "xray16";

import { registerGameClasses } from "@/mod/scripts/declarations/register/class_registrator";
import { getGameClassId } from "@/mod/scripts/declarations/register/game_registrator";
import { getUiClassId } from "@/mod/scripts/declarations/register/ui_registrator";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/* eslint @typescript-eslint/no-var-requires: 0 */

/**
 * Register methods for game classes, objects and types.
 */
extern("register", {
  /**
   * todo;
   */
  registerGameClasses: (factory: XR_object_factory): void => {
    const { registerGameClasses } = require("@/mod/scripts/declarations/register/class_registrator");

    registerGameClasses(factory);
  },
  /**
   * todo;
   */
  getGameClassId: (gameTypeOption: string, isServer: boolean): void => {
    const { getGameClassId } = require("@/mod/scripts/declarations/register/game_registrator");

    getGameClassId(gameTypeOption, isServer);
  },
  /**
   * todo;
   */
  getUiClassId: (gameType: string): void => {
    const { getUiClassId } = require("@/mod/scripts/declarations/register/ui_registrator");

    getUiClassId(gameType);
  },
});
