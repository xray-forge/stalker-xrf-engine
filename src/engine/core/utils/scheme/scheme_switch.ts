import { game, level, time_global } from "xray16";

import { IBaseSchemeLogic, IBaseSchemeState, IRegistryObjectState, registry } from "@/engine/core/database";
import { abort, assert } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActorSeenByObject } from "@/engine/core/utils/object/object_check";
import { getDistanceBetween, isObjectInZone } from "@/engine/core/utils/object/object_location";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/scheme_event";
import { activateSchemeBySection } from "@/engine/core/utils/scheme/scheme_logic";
import { NIL } from "@/engine/lib/constants/words";
import {
  ClientObject,
  EScheme,
  ESchemeCondition,
  ESchemeEvent,
  IniFile,
  LuaArray,
  Optional,
  TDistance,
  TDuration,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "scheme" });

/**
 * Cached switcher to check conditions based on scheme logic condition type.
 * Lua does not support switch cases so instead of 10+ IFs one callback from mapped object is called.
 * Comparing to original logic where for loop also calls 10+ IFs it is considered optimization.
 *
 * key - scheme condition type
 * value - callback checker+switcher, returns whether switch is activated
 */
const SCHEME_LOGIC_SWITCH: Record<
  ESchemeCondition | typeof NIL,
  (actor: ClientObject, object: ClientObject, state: IBaseSchemeState, logic: IBaseSchemeLogic) => boolean
> = {
  [NIL]: () => abort("Error: 'scheme/switch': unknown condition encountered."),
  [ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN]: (actor, object, state, logic) =>
    isActorSeenByObject(object) &&
    getDistanceBetween(actor, object) <= (logic.p1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN_NOT_VISIBLE]: (actor, object, state, logic) =>
    getDistanceBetween(actor, object) <= (logic.p1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN]: (actor, object, state, logic) =>
    isActorSeenByObject(object) &&
    getDistanceBetween(actor, object) > (logic.p1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN_NOT_VISIBLE]: (actor, object, state, logic) =>
    getDistanceBetween(actor, object) > (logic.p1 as TDistance) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_SIGNAL]: (actor, object, state, logic) =>
    (state.signals?.get(logic.p1 as TName) &&
      switchObjectSchemeToSection(
        object,
        state.ini,
        pickSectionFromCondList(actor, object, logic.condlist)
      )) as boolean,
  [ESchemeCondition.ON_INFO]: (actor, object, state, logic) =>
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_TIMER]: (actor, object, state, logic) =>
    time_global() >= registry.objects.get(object.id()).activationTime + (logic.p1 as TDuration) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_GAME_TIMER]: (actor, object, state, logic) =>
    game.get_game_time().diffSec(registry.objects.get(object.id()).activationGameTime) >= (logic.p1 as TTimestamp) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_IN_ZONE]: (actor, object, state, logic) =>
    isObjectInZone(actor, registry.zones.get(logic.p1 as TName)) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_NOT_IN_ZONE]: (actor, object, state, logic) =>
    !isObjectInZone(actor, registry.zones.get(logic.p1 as TName)) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_NPC_IN_ZONE]: (actor, object, state, logic) =>
    isObjectInZone(level.object_by_id(logic.objectId as TNumberId), registry.zones.get(logic.p2 as TName)) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_NPC_NOT_IN_ZONE]: (actor, object, state, logic) =>
    !isObjectInZone(level.object_by_id(logic.objectId as TNumberId), registry.zones.get(logic.p2 as TName)) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_INSIDE]: (actor, object, state, logic) =>
    isObjectInZone(actor, object) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
  [ESchemeCondition.ON_ACTOR_OUTSIDE]: (actor, object, state, logic) =>
    !isObjectInZone(actor, object) &&
    switchObjectSchemeToSection(object, state.ini, pickSectionFromCondList(actor, object, logic.condlist)),
};

/**
 * Try switching of active object scheme based on configured logic.
 * Checks object active logics conditions and verifies whether it should stay the same or pick new logics section.
 *
 * @param object - client object to try switching
 * @param state - current scheme state
 */
export function trySwitchToAnotherSection(object: ClientObject, state: IBaseSchemeState): boolean {
  const logic: Optional<LuaArray<IBaseSchemeLogic>> = state.logic;

  assert(logic, "Can't find `logic` in state, section '%s'.", state.section);

  for (const [, condition] of logic) {
    const conditionName: ESchemeCondition = (string.match(condition.name, "([%a_]*)")[0] as ESchemeCondition) || NIL;

    if (SCHEME_LOGIC_SWITCH[conditionName](registry.actor, object, state, condition)) {
      return true;
    }
  }

  return false;
}

/**
 * Explicitly switch object active scheme to new section.
 * Force active scheme to deactivate if it exists and is active - emit deactivation signal and proceed with switch.
 * If new section is invalid or matches active, skip any actions.
 *
 * @param object - object to switch
 * @param ini - object spawn ini
 * @param section - next active section
 * @returns whether scheme switch happened
 */
export function switchObjectSchemeToSection(object: ClientObject, ini: IniFile, section: Optional<TSection>): boolean {
  if (section === "" || section === null) {
    return false;
  }

  const state: IRegistryObjectState = registry.objects.get(object.id());
  const activeSection: Optional<TSection> = state.activeSection as TSection;

  if (activeSection === section) {
    return false;
  }

  logger.format("Switch section: '%s', '%s' -> '%s'", object.name(), activeSection, section);

  // Notify schemes about deactivation.
  if (activeSection !== null) {
    emitSchemeEvent(object, state[state.activeScheme as EScheme] as IBaseSchemeState, ESchemeEvent.DEACTIVATE, object);
  }

  state.activeSection = null;
  state.activeScheme = null;

  activateSchemeBySection(object, ini, section, state.smartTerrainName, false);

  return true;
}
