import { GameObject } from "xray16/alias";
import { extern, LuaArray, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { getActiveSchemeStateOptimistic, hasActiveScheme } from "@/engine/core/schemes/state";

import { logger } from "./shared";

/**
 * Try to switch the active scheme to another section for each object referenced by story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param params - List of story IDs of objects whose logic should be re-evaluated.
 */
extern("xr_effects.update_obj_logic", (_: GameObject, __: GameObject, params: LuaArray<TStringId>): void => {
  for (const [, storyId] of params) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    if (storyObject) {
      logger.info("Update object logic: %s", storyObject.id());

      const state: IRegistryObjectState = registry.objects.get(storyObject.id());

      if (hasActiveScheme(state)) {
        trySwitchToAnotherSection(storyObject, getActiveSchemeStateOptimistic(state));
      }
    }
  }
});
