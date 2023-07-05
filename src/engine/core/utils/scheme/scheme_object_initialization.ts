import { IRegistryObjectState, registry } from "@/engine/core/database";
import {
  getSectionsFromConditionLists,
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { ClientObject, EScheme, IniFile, LuaArray, Optional, TDistance, TNumberId, TSection } from "@/engine/lib/types";

/**
 * Synchronize object invulnerability state based.
 *
 * @param object - target client object
 */
export function initializeObjectInvulnerability(object: ClientObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const invulnerability: Optional<string> = readIniString(
    state.ini,
    state.activeSection,
    "invulnerable",
    false,
    "",
    null
  );

  const nextInvulnerabilityState: boolean =
    invulnerability === null
      ? false
      : pickSectionFromCondList(registry.actor, object, parseConditionsList(invulnerability)) === TRUE;

  if (object.invulnerable() !== nextInvulnerabilityState) {
    object.invulnerable(nextInvulnerabilityState);
  }
}

/**
 * Synchronize object weapon selection state.
 *
 * @param object - target client object
 * @param scheme - active scheme of the object
 * @param state - object registry state
 * @param section - active logics section of the object
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

  const canSelectSection: Optional<TSection> = pickSectionFromCondList(
    registry.actor,
    object,
    parseConditionsList(data)
  );

  object.can_select_weapon(canSelectSection === TRUE);
}

/**
 * Synchronize object items taking state.
 *
 * @param object - target client object
 * @param scheme - active scheme of the object
 * @param state - object registry state
 * @param section - active logics section of the object
 */
export function initializeObjectTakeItemsEnabledState(
  object: ClientObject,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const isTakeItemsEnabled: boolean = readIniBoolean(
    state.ini,
    state.ini.line_exist(section, "take_items") ? section : state.sectionLogic,
    "take_items",
    false,
    true
  );

  object.take_items_enabled(isTakeItemsEnabled);
}

/**
 * Synchronize object group with ini section configuration.
 *
 * @param object - target client object
 * @param ini - target ini config
 * @param section - active logics section of the object
 */
export function initializeObjectGroup(object: ClientObject, ini: IniFile, section: TSection): void {
  const group: TNumberId = readIniNumber(ini, section, "group", false, -1);

  if (group !== -1) {
    object.change_team(object.team(), object.squad(), group);
  }
}

/**
 * Synchronize object info portions based on active ini logic section.
 *
 * @param object - target client object
 * @param ini - target ini config
 * @param section - active logics section of the object
 */
export function initializeObjectInfo(object: ClientObject, ini: IniFile, section: TSection): void {
  const inInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "in", false, "")
  );
  const outInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "out", false, "")
  );

  for (const [, infoPortion] of inInfosList) {
    object.give_info_portion(infoPortion);
  }

  for (const [, infoPortion] of outInfosList) {
    object.disable_info_portion(infoPortion);
  }
}

/**
 * Synchronize object info portions based on active ini logic section.
 *
 * @param object - target client object
 * @param scheme - active logics scheme
 * @param state - active object registry state
 * @param section - active logics section of the object
 */
export function initializeObjectIgnoreThreshold(
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
      false,
      null
    );

    if (maxIgnoreDistance === null) {
      object.restore_max_ignore_monster_distance();
    } else {
      object.max_ignore_monster_distance(maxIgnoreDistance);
    }

    const ignoreMonster: Optional<TNumberId> = readIniNumber(
      state.ini,
      thresholdSection,
      "ignore_monster",
      false,
      null
    );

    if (ignoreMonster === null) {
      object.restore_ignore_monster_threshold();
    } else {
      object.ignore_monster_threshold(ignoreMonster);
    }
  }
}
