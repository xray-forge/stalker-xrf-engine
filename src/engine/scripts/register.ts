import { extern } from "@/engine/core/utils/binding";
import { AnyCallable, ObjectFactory } from "@/engine/lib/types";

/* eslint @typescript-eslint/no-var-requires: 0 */

/**
 * Register methods for game classes, objects and types.
 * Use dynamic imports to reduce pressure when engine tries to register all related class ids multiple times.
 */
extern("register", {
  /**
   * Register game classes of objects and link lua implementation with c++ counterpart.
   */
  registerGameClasses: (factory: ObjectFactory): void => {
    (require("@/engine/scripts/register/class_registrator").registerGameClasses as AnyCallable)(factory);
  },
  /**
   * Get current game class ID.
   */
  getGameClassId: (gameTypeOption: string, isServer: boolean): void => {
    (require("@/engine/scripts/register/game_class_id_registrator").getGameClassId as AnyCallable)(
      gameTypeOption,
      isServer
    );
  },
  /**
   * Get current game ui ID.
   */
  getUiClassId: (gameType: string): void => {
    (require("@/engine/scripts/register/ui_class_id_registrator").getUiClassId as AnyCallable)(gameType);
  },
});
