import { ActionPlanner, GameObject } from "xray16/alias";
import { extern, LuaArray, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { updateStalkerLogic } from "@/engine/core/utils/logics";

/**
 * Force a logic, action planner and state controller update for each stalker referenced by story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param params - List of story IDs of stalkers whose logic should be updated.
 */
extern("xr_effects.update_npc_logic", (_: GameObject, __: GameObject, params: LuaArray<TStringId>): void => {
  for (const [, storyId] of params) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    if (storyObject) {
      const state: IRegistryObjectState = registry.objects.get(storyObject.id());

      updateStalkerLogic(storyObject, state);

      const planner: ActionPlanner = storyObject.motivation_action_manager();

      planner.update();
      planner.update();
      planner.update();

      // todo: Is it ok? Why?
      state.stateController!.update();
      state.stateController!.update();
      state.stateController!.update();
      state.stateController!.update();
      state.stateController!.update();
      state.stateController!.update();
      state.stateController!.update();
    }
  }
});
