import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { getObjectSquad } from "@/engine/core/utils/squad";

/**
 * Check if current squad action matches provided value.
 */
extern(
  "xr_conditions.squad_curr_action",
  (_: GameObject, object: GameObject, [squadActionType]: [ESquadActionType]): boolean => {
    return getObjectSquad(object)!.currentAction?.type === squadActionType;
  }
);
