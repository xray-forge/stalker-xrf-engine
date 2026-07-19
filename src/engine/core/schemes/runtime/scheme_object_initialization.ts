import { GameObject, IniFile } from "xray16/alias";
import { LuaArray, NIL, Nillable, TDistance, TNumberId, TRUE, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EScheme } from "@/engine/core/schemes/types";
import {
  getSectionsFromConditionLists,
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
} from "@/engine/core/utils/ini";

/**
 * Synchronize object invulnerability with the active section's condition list.
 * Reuses the parsed condition list until the active section changes.
 *
 * @param object - Game object.
 * @param state - Registry state containing the active section and cached condition list.
 */
export function initializeObjectInvulnerability(object: GameObject, state: IRegistryObjectState): void {
  if (!state.hasInvulnerabilityCache || state.invulnerabilitySection !== state.activeSection) {
    const invulnerability: Nillable<string> = readIniString(state.ini, state.activeSection, "invulnerable", false);

    state.hasInvulnerabilityCache = true;
    state.invulnerabilitySection = state.activeSection;
    state.invulnerabilityConditionList = invulnerability ? parseConditionsList(invulnerability) : null;
  }

  const nextInvulnerabilityState: boolean = $isNil(state.invulnerabilityConditionList)
    ? false
    : pickSectionFromCondList(registry.actor, object, state.invulnerabilityConditionList) === TRUE;

  if (object.invulnerable() !== nextInvulnerabilityState) {
    object.invulnerable(nextInvulnerabilityState);
  }
}

/**
 * Synchronize object weapon selection state.
 *
 * @param object - Game object.
 * @param scheme - Active scheme of the object.
 * @param state - Object registry state.
 * @param section - Active logics section of the object.
 */
export function initializeObjectCanSelectWeaponState(
  object: GameObject,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  let data: string = readIniString(state.ini, section, "can_select_weapon", false, null, "");

  if (data === "") {
    data = readIniString(state.ini, state.sectionLogic, "can_select_weapon", false, null, TRUE);
  }

  const canSelectSection: Nillable<TSection> = pickSectionFromCondList(
    registry.actor,
    object,
    parseConditionsList(data)
  );

  object.can_select_weapon(canSelectSection === TRUE);
}

/**
 * Synchronize object items taking state.
 *
 * @param object - Game object.
 * @param scheme - Active scheme of the object.
 * @param state - Object registry state.
 * @param section - Active logics section of the object.
 */
export function initializeObjectTakeItemsEnabledState(
  object: GameObject,
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
 * @param object - Game object.
 * @param ini - Target ini config.
 * @param section - Active logics section of the object.
 */
export function initializeObjectGroup(object: GameObject, ini: IniFile, section: TSection): void {
  const group: TNumberId = readIniNumber(ini, section, "group", false, -1);

  if (group !== -1) {
    object.change_team(object.team(), object.squad(), group);
  }
}

/**
 * Synchronize object info portions based on active ini logic section.
 *
 * @param object - Game object.
 * @param ini - Target ini config.
 * @param section - Active logics section of the object.
 */
export function initializeObjectInfo(object: GameObject, ini: IniFile, section: TSection): void {
  const inInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "in", false)
  );
  const outInfosList: LuaArray<TInfoPortion> = getSectionsFromConditionLists(
    object,
    readIniString(ini, section, "out", false)
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
 * @param object - Game object.
 * @param scheme - Active logics scheme.
 * @param state - Active object registry state.
 * @param section - Active logics section of the object.
 */
export function initializeObjectIgnoreThreshold(
  object: GameObject,
  scheme: Nillable<EScheme>,
  state: IRegistryObjectState,
  section: TSection
): void {
  const thresholdSection: Nillable<TSection> =
    $isNil(scheme) || scheme === NIL
      ? readIniString(state.ini, state.sectionLogic, "threshold", false)
      : readIniString(state.ini, section, "threshold", false);

  if (thresholdSection) {
    const maxIgnoreDistance: Nillable<TDistance> = readIniNumber(
      state.ini,
      thresholdSection,
      "max_ignore_distance",
      false,
      null
    );

    if ($isNil(maxIgnoreDistance)) {
      object.restore_max_ignore_monster_distance();
    } else {
      object.max_ignore_monster_distance(maxIgnoreDistance);
    }

    const ignoreMonster: Nillable<TNumberId> = readIniNumber(
      state.ini,
      thresholdSection,
      "ignore_monster",
      false,
      null
    );

    if ($isNil(ignoreMonster)) {
      object.restore_ignore_monster_threshold();
    } else {
      object.ignore_monster_threshold(ignoreMonster);
    }
  }
}
