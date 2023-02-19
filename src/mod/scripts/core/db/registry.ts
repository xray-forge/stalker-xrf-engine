import type { XR_game_object } from "xray16";

import type { TAbstractSchemeConstructor } from "@/mod/scripts/core/schemes/base";

/**
 * Global-level registry of objects and references.
 * Stores up-to-date game state.
 */
export const registry = {
  /**
   * Current actor, injected on game start.
   */
  actor: null as unknown as XR_game_object,
  /**
   * List of activated schemes in game.
   */
  schemes: new LuaTable<string, TAbstractSchemeConstructor>(),
  /**
   * List of current zone crows spawned.
   */
  crows: {
    storage: new LuaTable<number, number>(),
    count: 0,
  },
};
