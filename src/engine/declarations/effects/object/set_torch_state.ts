import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { misc } from "@/engine/constants/items/misc";
import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Set torch state for an object if story id object exists and has it.
 * Expect `on` or `off` as state.
 *
 * Where:
 * - storyId - story ID of object to toggle torch
 * - state - string value representing next torch state (on, off).
 */
extern(
  "xr_effects.set_torch_state",
  (_: GameObject, __: GameObject, [storyId, state]: [TStringId, Nillable<string>]): void => {
    if (!state) {
      abort("Not enough parameters in 'set_torch_state' function effect.");
    }

    const torch: Nillable<GameObject> = getObjectByStoryId(storyId)?.object(misc.device_torch) as Nillable<GameObject>;

    if (torch) {
      torch.enable_attachable_item(state === "on");
    }
  }
);
