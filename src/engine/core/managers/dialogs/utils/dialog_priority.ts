import { level } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import { DialogManager } from "@/engine/core/managers/dialogs";
import {
  EGenericPhraseCategory,
  IPhrasesDescriptor,
  TAvailablePhrasesMap,
  TPRTTable,
} from "@/engine/core/managers/dialogs/dialog_types";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, Optional, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function shouldShowPhrase(
  object: GameObject,
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  phraseId: TStringId
): boolean {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId)?.told) {
    return false;
  }

  // Recalculate current phrase priority
  calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId), object, phraseId);

  // If current phrase is with the highest priority - show it.
  return isHighestPriorityPhrase(PTsubtable, PRTsubtable, object, phraseId);
}

/**
 * todo;
 */
export function shouldHidePhraseCategory(object: GameObject, category: EGenericPhraseCategory): boolean {
  const dialogManager: DialogManager = getManager(DialogManager);

  const [priority, id] = getHighestPriorityPhrase(
    dialogConfig.PHRASES.get(category),
    dialogManager.priorityTable.get(category),
    object
  );

  return priority < 0 || id === 0;
}

/**
 * todo;
 */
export function isHighestPriorityPhrase(
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  object: GameObject,
  phraseId: string
) {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    const pr: TRate = PRTsubtable.get(objectId).get(phraseId);

    if (pr < 0) {
      return false;
    }

    for (const [phrId, priority] of PRTsubtable.get(objectId)) {
      if (phrId !== "ignore_once" && phrId !== "told") {
        if (priority > pr) {
          return false;
        }
      }
    }

    return true;
  } else {
    resetPhrasePriority(PTsubtable, PRTsubtable, object, phraseId);

    return false;
  }
}

/**
 * todo;
 */
export function setPhraseHighestPriority(PRTsubtable: TPRTTable, objectId: TNumberId, phraseId: TStringId) {
  if (PRTsubtable.get(objectId) === null) {
    PRTsubtable.set(objectId, new LuaTable());
  }

  PRTsubtable.get(objectId).set(phraseId, 255);
}

/**
 * todo;
 */
export function resetPhrasePriority(
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  object: GameObject,
  phraseId: Optional<string>
): void {
  const objectId: TNumberId = object.id();

  if (phraseId === null) {
    logger.warn("Null provided for resetPhrasePriority");
  }

  if (PRTsubtable.get(objectId) !== null) {
    PRTsubtable.get(objectId).set(phraseId!, -1);
  } else {
    PRTsubtable.set(objectId, new LuaTable());
    PRTsubtable.get(objectId).set(
      phraseId!,
      calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId!), object, phraseId!)
    );
  }
}

/**
 * todo;
 */
export function getHighestPriorityPhrase(
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  object: GameObject
): LuaMultiReturn<[number, string | 0]> {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    let id: TStringId | 0 = 0;
    let priority: TRate = -1;

    for (const [phraseId, phrasePriority] of PRTsubtable.get(objectId)) {
      if (phraseId !== "ignore_once" && phraseId !== "told") {
        if (phrasePriority > priority) {
          priority = phrasePriority;
          id = phraseId;
        }
      }
    }

    return $multi(priority, id);
  } else {
    resetPhrasePriority(PTsubtable, PRTsubtable, object, null);

    return $multi(-1, 0);
  }
}

/**
 * todo;
 */
export function fillPriorityTable(object: GameObject, PTSubtable: TAvailablePhrasesMap, PRTSubtable: TPRTTable): void {
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
