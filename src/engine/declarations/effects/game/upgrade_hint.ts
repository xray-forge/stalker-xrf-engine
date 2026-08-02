import { GameObject } from "xray16/alias";
import { extern, LuaArray, Nillable, TLabel } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";

/**
 * Set current mechanic upgrade hints based on list of parameters.
 */
extern("xr_effects.upgrade_hint", (_: GameObject, __: GameObject, parameters: Nillable<LuaArray<TLabel>>): void => {
  getManager(UpgradesManager).setCurrentHints(parameters);
});
