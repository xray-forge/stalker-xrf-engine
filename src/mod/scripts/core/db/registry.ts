import type { XR_game_object } from "xray16";

import type { TAbstractSchemeConstructor } from "@/mod/scripts/core/schemes/base";

export const registry = {
  /**
   * Current actor, injected on game start.
   */
  actor: null as unknown as XR_game_object,
  /**
   * List of activated schemes in game.
   */
  schemes: new LuaTable<string, TAbstractSchemeConstructor>(),
};
