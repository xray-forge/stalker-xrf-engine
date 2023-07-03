import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { EActionId } from "@/engine/core/schemes";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import {
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, Optional, TDistance, TNumberId, TSection } from "@/engine/lib/types";

/**
 * @param objectId - target object id to check state
 * @returns whether object is currently asleep
 */
export function isObjectAsleep(objectId: TNumberId): boolean {
  return registry.objects.get(objectId)?.stateManager?.animstate.states.currentState === EStalkerState.SLEEP;
}

/**
 * @param objectId - target object id to check
 * @returns whether object is wounded.
 */
export function isObjectWounded(objectId: TNumberId): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

  if (!state || !state[EScheme.WOUNDED]) {
    return false;
  } else {
    return tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL;
  }
}

/**
 * @param object - target game object to check
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

  return (
    actionPlanner !== null &&
    actionPlanner.initialized() &&
    actionPlanner.current_action_id() === EActionId.MEET_WAITING_ACTIVITY
  );
}

/**
 * todo: rename, update
 */
export function initializeObjectCanSelectWeaponState(
  object: ClientObject,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  let data: string = readIniString(state.ini, section, "can_select_weapon", false, "", "");

  if (data === "") {
    data = readIniString(state.ini, state.sectionLogic, "can_select_weapon", false, "", TRUE);
  }

  const conditionsList: TConditionList = parseConditionsList(data);
  const canSelectSection: TSection = pickSectionFromCondList(registry.actor, object, conditionsList)!;

  object.can_select_weapon(canSelectSection === TRUE);
}

/**
 * todo
 */
export function resetObjectIgnoreThreshold(
  object: ClientObject,
  scheme: Optional<EScheme>,
  state: IRegistryObjectState,
  section: TSection
): void {
  const thresholdSection: Optional<TSection> =
    scheme === null || scheme === NIL
      ? readIniString(state.ini, state.sectionLogic, "threshold", false, "")
      : readIniString(state.ini, section, "threshold", false, "");

  if (thresholdSection) {
    const maxIgnoreDistance: Optional<TDistance> = readIniNumber(
      state.ini,
      thresholdSection,
      "max_ignore_distance",
      false
    );

    if (maxIgnoreDistance === null) {
      object.restore_max_ignore_monster_distance();
    } else {
      object.max_ignore_monster_distance(maxIgnoreDistance);
    }

    const ignoreMonster: Optional<TNumberId> = readIniNumber(state.ini, thresholdSection, "ignore_monster", false);

    if (ignoreMonster === null) {
      object.restore_ignore_monster_threshold();
    } else {
      object.ignore_monster_threshold(ignoreMonster);
    }
  }
}

/**
 * todo: rename, update
 */
export function initializeObjectTakeItemsEnabledState(
  object: ClientObject,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const isTakeItemsEnabled: boolean = state.ini.line_exist(section, "take_items")
    ? readIniBoolean(state.ini, section, "take_items", false, true)
    : readIniBoolean(state.ini, state.sectionLogic, "take_items", false, true);

  object.take_items_enabled(isTakeItemsEnabled);
}
