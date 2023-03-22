import { game, level, time_global, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes";
import { switchObjectSchemeToSection } from "@/engine/core/schemes/base/utils/switchObjectSchemeToSection";
import { abort } from "@/engine/core/utils/assertion";
import { isObjectInZone } from "@/engine/core/utils/check/check";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActorSeenByObject } from "@/engine/core/utils/object";
import { getDistanceBetween } from "@/engine/core/utils/physics";
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TDistance, TDuration, TName, TNumberId, TTimestamp } from "@/engine/lib/types";
import { ESchemeCondition } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
const SCHEME_LOGIC_SWITCH: Record<
  ESchemeCondition | typeof NIL,
  (actor: XR_game_object, object: XR_game_object, state: IBaseSchemeState, logic: IBaseSchemeLogic) => boolean
> = {
  [NIL]: () => abort("WARNING: try_switch_to_another_section: unknown condition encountered"),
  [ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN]: (actor, object, state, logic) =>
    isActorSeenByObject(object) &&
    getDistanceBetween(actor, object) <= (logic.v1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN_AND_VISIBLE]: (actor, object, state, logic) =>
    getDistanceBetween(actor, object) <= (logic.v1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN]: (actor, object, state, logic) =>
    isActorSeenByObject(object) &&
    getDistanceBetween(actor, object) > (logic.v1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN_AND_VISIBLE]: (actor, object, state, logic) =>
    getDistanceBetween(actor, object) > (logic.v1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_SIGNAL]: (actor, object, state, logic) =>
    (state.signals &&
      state.signals.get(logic.v1 as TName) &&
      switchObjectSchemeToSection(
        object,
        state.ini!,
        pickSectionFromCondList(actor, object, logic.condlist)!
      )) as boolean,
  [ESchemeCondition.ON_INFO]: (actor, object, state, logic) =>
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_TIMER]: (actor, object, state, logic) =>
    time_global() >= registry.objects.get(object.id()).activation_time + (logic.v1 as TDuration) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_GAME_TIMER]: (actor, object, state, logic) =>
    game.get_game_time().diffSec(registry.objects.get(object.id()).activation_game_time) >= (logic.v1 as TTimestamp) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_IN_ZONE]: (actor, object, state, logic) =>
    isObjectInZone(actor, registry.zones.get(logic.v1 as TName)) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_NOT_IN_ZONE]: (actor, object, state, logic) =>
    !isObjectInZone(actor, registry.zones.get(logic.v1 as TName)) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_NPC_IN_ZONE]: (actor, object, state, logic) =>
    isObjectInZone(level.object_by_id(logic.npc_id as TNumberId), registry.zones.get(logic.v2 as TName)) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_NPC_NOT_IN_ZONE]: (actor, object, state, logic) =>
    !isObjectInZone(level.object_by_id(logic.npc_id as TNumberId), registry.zones.get(logic.v2 as TName)) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_INSIDE]: (actor, object, state, logic) =>
    isObjectInZone(actor, object) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
  [ESchemeCondition.ON_ACTOR_OUTSIDE]: (actor, object, state, logic) =>
    !isObjectInZone(actor, object) &&
    switchObjectSchemeToSection(object, state.ini!, pickSectionFromCondList(actor, object, logic.condlist)!),
};

/**
 * todo;
 */
export function trySwitchToAnotherSection(
  object: XR_game_object,
  state: IBaseSchemeState,
  actor: Optional<XR_game_object>
): boolean {
  const logic: Optional<LuaArray<IBaseSchemeLogic>> = state.logic;

  if (!actor) {
    abort("trySwitchToAnotherSection(): error in implementation of scheme '%s': actor is null", state.scheme);
  } else if (!logic) {
    abort(
      "Can't find script switching information in storage, scheme '%s'",
      registry.objects.get(object.id()).active_scheme
    );
  }

  for (const [index, condition] of logic) {
    const conditionName: ESchemeCondition = (string.match(condition.name, "([%a_]*)")[0] as ESchemeCondition) || NIL;

    if (SCHEME_LOGIC_SWITCH[conditionName](actor, object, state, condition)) {
      return true;
    }
  }

  return false;
}
