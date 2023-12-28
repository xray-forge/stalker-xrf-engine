import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { IPhrasesDescriptor, TPHRTable, TPRTTable } from "@/engine/core/managers/dialogs/dialog_types";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, TNumberId, TRate, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export function fillPriorityTable(object: GameObject, PTSubtable: TPHRTable, PRTSubtable: TPRTTable): void {
  const objectId: TNumberId = object.id();

  if (PRTSubtable.get(objectId) === null) {
    PRTSubtable.set(objectId, new LuaTable());
  }

  for (const [, phrase] of PTSubtable) {
    // Calculate priority for each phrase
    calculatePhrasePriority(PRTSubtable, phrase, object, phrase.id);
  }
}

/**
 * todo;
 */
export function calculatePhrasePriority(
  PRTSubtable: TPRTTable,
  PTIDSubtable: IPhrasesDescriptor,
  object: GameObject,
  phraseId: TStringId
): TRate {
  const objectId: TNumberId = object.id();

  let fLevel: boolean = false;
  let fComm: boolean = false;
  let priority: number = -1;

  if (PTIDSubtable.npc_community === "not_set") {
    fComm = true;
  } else if (PTIDSubtable.npc_community.get(1) === "all") {
    priority = priority + 1;
    fComm = true;
  } else {
    for (const i of $range(1, PTIDSubtable.npc_community.length())) {
      if (PTIDSubtable.npc_community.get(i) === getObjectCommunity(object)) {
        priority = priority + 2;
        fComm = true;
        break;
      }
    }

    priority -= 1;
  }

  if (PTIDSubtable.level === "not_set") {
    fLevel = true;
  } else if (PTIDSubtable.level.get(1) === "all") {
    priority = priority + 1;
    fLevel = true;
  } else {
    for (const i of $range(1, PTIDSubtable.level.length())) {
      if (PTIDSubtable.level.get(i) === level.name()) {
        priority = priority + 2;
        fLevel = true;
        break;
      }
    }
  }

  if (PTIDSubtable.actor_community === "not_set") {
    priority = priority + 0;
  } else if (PTIDSubtable.actor_community === "all") {
    priority = priority + 1;
  } else {
    for (const i of $range(1, PTIDSubtable.actor_community.length())) {
      if (PTIDSubtable.actor_community.get(i) === getObjectCommunity(registry.actor)) {
        priority = priority + 2;
        break;
      }
    }
  }

  if (PTIDSubtable.wounded === TRUE) {
    // --if (!(ActionWoundManager.is_heavy_wounded_by_id(object.id())) {
    priority = isObjectWounded(object.id()) ? priority + 1 : -1;
  } else {
    // --if(ActionWoundManager.is_heavy_wounded_by_id(object.id())) {
    priority = isObjectWounded(object.id()) ? -1 : priority + 1;
  }

  if (fComm === false || fLevel === false) {
    priority = -1;
  }

  if (PRTSubtable.get(object.id()).get("ignore_once") !== null) {
    if (PTIDSubtable.once === TRUE) {
      priority = -1;
    }
  }

  if (PRTSubtable.get(objectId).get(phraseId) !== null && PRTSubtable.get(objectId).get(phraseId) === 255) {
    priority = 255;
  }

  for (const [, condition] of PTIDSubtable.info) {
    if (condition.name) {
      if (condition.required === true) {
        if (!hasInfoPortion(condition.name)) {
          priority = -1;
          break;
        }
      } else {
        if (hasInfoPortion(condition.name)) {
          priority = -1;
          break;
        }
      }
    }
  }

  PRTSubtable.get(objectId).set(phraseId, priority);

  return priority;
}
