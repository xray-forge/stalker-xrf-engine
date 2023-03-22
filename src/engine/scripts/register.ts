import type { XR_object_factory } from "xray16";

import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyCallable } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/* eslint @typescript-eslint/no-var-requires: 0 */

/**
 * Register methods for game classes, objects and types.
 * Use dynamic imports to reduce pressure when engine tries to register all related class ids multiple times.
 */
extern("register", {
  /**
   * todo: Description.
   */
  registerGameClasses: (factory: XR_object_factory): void => {
    (require("@/engine/scripts/register/class_registrator").registerGameClasses as AnyCallable)(factory);
  },
  /**
   * todo: Description.
   */
  getGameClassId: (gameTypeOption: string, isServer: boolean): void => {
    (require("@/engine/scripts/register/game_registrator").getGameClassId as AnyCallable)(gameTypeOption, isServer);
  },
  /**
   * todo: Description.
   */
  getUiClassId: (gameType: string): void => {
    (require("@/engine/scripts/register/ui_registrator").getUiClassId as AnyCallable)(gameType);
  },
});
