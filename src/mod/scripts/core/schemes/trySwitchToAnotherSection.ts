import { game, level, time_global, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ESchemeCondition } from "@/mod/lib/types/configuration";
import { stringifyAsJson } from "@/mod/lib/utils/json";
import { IStoredObject, storage, zoneByName } from "@/mod/scripts/core/db";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { isSeeingActor } from "@/mod/scripts/utils/alife";
import { isNpcInZone } from "@/mod/scripts/utils/checkers";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getDistanceBetween } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("trySwitchToAnotherSection");

export function isSchemeCondition(condition: string, conditionType: ESchemeCondition): boolean {
  return string.find(condition, "^" + conditionType + "%d*$")[0] !== null;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function trySwitchToAnotherSection(
  object: XR_game_object,
  state: IStoredObject,
  actor: Optional<XR_game_object>
): boolean {
  const logic: LuaTable<number> = state.logic;

  if (!actor) {
    abort("try_switch_to_another_section(): error in implementation of scheme '%s': actor is null", state.scheme);
  }

  if (!logic) {
    abort("Can't find script switching information in storage, scheme '%s'", storage.get(object.id()).active_scheme);
  }

  const npcId = object.id();
  let switched: boolean = false;

  // todo: Parse once and then compare, do not do parsing in loop.
  // todo: Parse once and then compare, do not do parsing in loop.
  // todo: Parse once and then compare, do not do parsing in loop.
  // todo: Use switch case.
  // todo: Examples: on_info5 on_actor_inside on_info2
  for (const [n, cond] of logic) {
    logger.info("GG", cond.name);

    if (isSchemeCondition(cond.name, ESchemeCondition.ACTOR_DISTANCE_LESS_THAN)) {
      if (isSeeingActor(object) && getDistanceBetween(actor, object) <= cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ACTOR_DISTANCE_LESS_THAN_AND_VISIBLE)) {
      if (getDistanceBetween(actor, object) <= cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ACTOR_DISTANCE_GREATER_THAN)) {
      if (isSeeingActor(object) && getDistanceBetween(actor, object) > cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ACTOR_DISTANCE_GREATER_THAN_AND_VISIBLE)) {
      if (getDistanceBetween(actor, object) > cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_SIGNAL)) {
      if (state.signals && state.signals[cond.v1]) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_INFO)) {
      switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_TIMER)) {
      if (time_global() >= storage.get(npcId).activation_time + cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_GAME_TIMER)) {
      if (game.get_game_time().diffSec(storage.get(npcId).activation_game_time) >= cond.v1) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_ACTOR_IN_ZONE)) {
      if (isNpcInZone(actor, zoneByName.get(cond.v1))) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_ACTOR_NOT_IN_ZONE)) {
      if (!isNpcInZone(actor, zoneByName.get(cond.v1))) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_NPC_IN_ZONE)) {
      if (isNpcInZone(level.object_by_id(cond.npc_id), zoneByName.get(cond.v2))) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_NPC_NOT_IN_ZONE)) {
      if (!isNpcInZone(level.object_by_id(cond.npc_id), zoneByName.get(cond.v2))) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_ACTOR_INSIDE)) {
      if (isNpcInZone(actor, object)) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else if (isSchemeCondition(cond.name, ESchemeCondition.ON_ACTOR_OUTSIDE)) {
      if (!isNpcInZone(actor, object)) {
        switched = switchToSection(object, state.ini!, pickSectionFromCondList(actor, object, cond.condlist)!);
      }
    } else {
      abort(
        "WARNING: object '%s': try_switch_to_another_section: unknown condition '%s' encountered",
        object.name(),
        cond.name
      );
    }

    if (switched) {
      return true;
    }
  }

  return false;
}
