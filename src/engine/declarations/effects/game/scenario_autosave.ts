import { GameObject } from "xray16/alias";
import { extern, TName } from "xray16/lib";

import { createGameAutoSave } from "@/engine/core/utils/game_save";

/**
 * Create game save based on provide name.
 */
extern("xr_effects.scenario_autosave", (_: GameObject, __: GameObject, [name]: [TName]): void => {
  createGameAutoSave(name);
});
