import { game } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { getActorTargetSurgeCover, isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { extern } from "@/engine/core/utils/binding";
import { parseConditionsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { GameObject, Optional, TLabel, TNumberId, TSection, TStringId } from "@/engine/lib/types";

/**
 * Check condlist as part of condition functor.
 */
extern("task_functors.condlist", (id: TStringId, field: string, condlist: string): Optional<TSection> => {
  return pickSectionFromCondList(registry.actor, null, parseConditionsList(condlist));
});

/**
 * Get task for current surge task title.
 */
extern("task_functors.surge_task_title", (): TLabel => {
  return isActorInSurgeCover() ? "hide_from_surge_name_2" : "hide_from_surge_name_1";
});

/**
 * Get task for current surge task description.
 */
extern("task_functors.surge_task_descr", (): TLabel => {
  return game.translate_string(isActorInSurgeCover() ? "hide_from_surge_descr_2_a" : "hide_from_surge_descr_1_a");
});

/**
 * Get target object id based on condlist returning story id.
 */
extern("task_functors.target_condlist", (id: TStringId, field: string, condlist: string) => {
  const value: Optional<TSection> = pickSectionFromCondList(registry.actor, null, parseConditionsList(condlist));

  return value ? getObjectIdByStoryId(value) : null;
});

/**
 * Get target surge cover ID for actor to navigate to.
 * Returns nearest cover id if it exists or null if none found / actor in one currently.
 */
extern("task_functors.surge_task_target", (): Optional<TNumberId> => {
  const surgeCover: Optional<GameObject> = getActorTargetSurgeCover();

  return surgeCover ? surgeCover.id() : null;
});
