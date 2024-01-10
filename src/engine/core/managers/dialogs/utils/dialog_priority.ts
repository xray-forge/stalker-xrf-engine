import { level } from "xray16";

import { registry } from "@/engine/core/database";
import {
  IPhrasesDescriptor,
  TPhrasesAvailableMap,
  TPhrasesPriorityMap,
} from "@/engine/core/managers/dialogs/dialog_types";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, Optional, TName, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function setPhraseHighestPriority(
  priorities: TPhrasesPriorityMap,
  objectId: TNumberId,
  phraseId: TStringId
): void {
  if (!priorities.get(objectId)) {
    priorities.set(objectId, new LuaTable());
  }

  priorities.get(objectId).set(phraseId, MAX_U8);
}

/**
 * todo;
 */
export function resetPhrasePriority(
  phrases: TPhrasesAvailableMap,
  priorities: TPhrasesPriorityMap,
  object: GameObject,
  phraseId: Optional<TStringId>
): void {
  const objectId: TNumberId = object.id();

  if (!phraseId) {
    logger.format("Null provided for resetPhrasePriority method");
  }

  if (priorities.has(objectId)) {
    priorities.get(objectId).set(phraseId!, -1);
  } else {
    priorities.set(objectId, new LuaTable());
    priorities
      .get(objectId)
      .set(phraseId!, calculatePhrasePriority(phrases.get(phraseId!), priorities, object, phraseId!));
  }
}

/**
 * todo;
 */
export function getHighestPriorityPhrase(
  phrases: TPhrasesAvailableMap,
  priorities: TPhrasesPriorityMap,
  object: GameObject
): LuaMultiReturn<[TRate, TStringId | 0]> {
  const objectId: TNumberId = object.id();

  // No priorities set for an object, just reset.
  if (priorities.get(objectId) === null) {
    resetPhrasePriority(phrases, priorities, object, null);

    return $multi(-1, 0);
  }

  let id: TStringId | 0 = 0;
  let priority: TRate = -1;

  for (const [phraseId, phrasePriority] of priorities.get(objectId)) {
    // Ignore meta info keys.
    if (phraseId !== "ignoreOnce" && phraseId !== "told" && phrasePriority > priority) {
      id = phraseId;
      priority = phrasePriority;
    }
  }

  return $multi(priority, id);
}

/**
 * todo;
 */
export function fillPhrasesPriorities(
  object: GameObject,
  phrases: TPhrasesAvailableMap,
  priorities: TPhrasesPriorityMap
): void {
  const objectId: TNumberId = object.id();

  if (priorities.get(objectId) === null) {
    priorities.set(objectId, new LuaTable());
  }

  for (const [, phrase] of phrases) {
    // Calculate priority for each phrase
    calculatePhrasePriority(phrase, priorities, object, phrase.id);
  }
}

/**
 * todo;
 */
export function calculatePhrasePriority(
  phraseDescriptor: IPhrasesDescriptor,
  phrasesPriorities: TPhrasesPriorityMap,
  object: GameObject,
  phraseId: TStringId
): TRate {
  const objectId: TNumberId = object.id();

  let isMatchingLevel: boolean = false;
  let isMatchingCommunity: boolean = false;
  let priority: TRate = -1;

  // Check if community of NPC for phrase matching requirement.
  if (phraseDescriptor.npcCommunity === "not_set") {
    isMatchingCommunity = true;
  } else if (phraseDescriptor.npcCommunity.get(1) === "all") {
    priority += 1;
    isMatchingCommunity = true;
  } else {
    const objectCommunity: TName = getObjectCommunity(object);

    for (const [, community] of phraseDescriptor.npcCommunity) {
      if (community === objectCommunity) {
        priority += 2; // Compensate decrement applied to `else` branch.
        isMatchingCommunity = true;
        break;
      }
    }

    priority -= 1;
  }

  // Check if level for phrase matching requirement.
  if (phraseDescriptor.level === "not_set") {
    isMatchingLevel = true;
  } else if (phraseDescriptor.level.get(1) === "all") {
    priority += 1;
    isMatchingLevel = true;
  } else {
    const currentLevelName: TName = level.name();

    for (const [, levelName] of phraseDescriptor.level) {
      if (levelName === currentLevelName) {
        priority += 2;
        isMatchingLevel = true;
        break;
      }
    }
  }

  // Check if actor community for phrase matching requirement.
  if (phraseDescriptor.actorCommunity === "not_set") {
    priority += 0;
  } else if (phraseDescriptor.actorCommunity === "all") {
    priority += 1;
  } else {
    const actorCommunity: TName = getObjectCommunity(registry.actor);

    for (const [, community] of phraseDescriptor.actorCommunity) {
      if (community === actorCommunity) {
        priority += 2;
        break;
      }
    }
  }

  // Check if wounded check is handled.
  if (phraseDescriptor.wounded) {
    priority = isObjectWounded(objectId) ? priority + 1 : -1;
  } else {
    priority = isObjectWounded(objectId) ? -1 : priority + 1;
  }

  if (!isMatchingCommunity || !isMatchingLevel) {
    priority = -1;
  }

  if (phrasesPriorities.get(objectId).get("ignoreOnce") !== null && phraseDescriptor.once === TRUE) {
    priority = -1;
  }

  if (
    phrasesPriorities.get(objectId).get(phraseId) !== null &&
    phrasesPriorities.get(objectId).get(phraseId) === MAX_U8
  ) {
    priority = MAX_U8;
  }

  for (const [, condition] of phraseDescriptor.info) {
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

  phrasesPriorities.get(objectId).set(phraseId, priority);

  return priority;
}
