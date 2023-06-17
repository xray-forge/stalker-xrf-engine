import { callback, clsid, game, ini_file, time_global } from "xray16";

import { getObjectLogicIniConfig, IRegistryObjectState, IStoredOfflineObject, registry } from "@/engine/core/database";
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { MapDisplayManager } from "@/engine/core/managers/interface/MapDisplayManager";
import { SmartTerrain } from "@/engine/core/objects";
import { ISmartTerrainJob } from "@/engine/core/objects/server/smart_terrain/types";
import {
  ESchemeEvent,
  IBaseSchemeLogic,
  IBaseSchemeState,
  ObjectRestrictionsManager,
  TAbstractSchemeConstructor,
} from "@/engine/core/schemes";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { getObjectConfigOverrides, pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getSchemeFromSection } from "@/engine/core/utils/ini/parse";
import { readIniConditionList, readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  getObjectSmartTerrain,
  initializeObjectCanSelectWeaponState,
  initializeObjectTakeItemsEnabledState,
  resetObjectGroup,
  resetObjectIgnoreThreshold,
  resetObjectInvulnerability,
  scriptReleaseObject,
  sendToNearestAccessibleVertex,
  setObjectInfo,
} from "@/engine/core/utils/object/object_general";
import { disableObjectBaseSchemes } from "@/engine/core/utils/scheme/setup";
import { spawnDefaultObjectItems } from "@/engine/core/utils/spawn";
import { ERelation } from "@/engine/lib/constants/relations";
import { NIL } from "@/engine/lib/constants/words";
import {
  AnyArgs,
  AnyContextualCallable,
  AnyObject,
  ClientObject,
  EClientObjectRelation,
  EScheme,
  ESchemeType,
  IniFile,
  Optional,
  TCount,
  TName,
  TNumberId,
  TPath,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 * todo; probably remove
 */
export function getObjectGenericSchemeOverrides(object: ClientObject): Optional<LuaTable<string>> {
  return $fromObject(registry.objects.get(object.id()).overrides as AnyObject);
}

/**
 * Check if provided scheme state is active.
 * todo: Get only section, not whole state.
 */
export function isSectionActive(object: ClientObject, state: IBaseSchemeState): boolean {
  assertDefined(state.section, "Object %s '%s': state.section is null.", object.name(), state.section);

  return state.section === registry.objects.get(object.id()).active_section;
}

/**
 * Emit scheme event for active `actions` list in scheme state.
 *
 * @param object - client object working on scheme
 * @param state - scheme state for emitting
 * @param event - event type to emit
 * @param rest - event args
 */
export function emitSchemeEvent(
  object: ClientObject,
  state: IBaseSchemeState,
  event: ESchemeEvent,
  ...rest: AnyArgs
): void {
  if (!state || !state.actions) {
    return;
  }

  // todo: Probably it is Set and `isHandlerActive` check is not needed.
  for (const [actionHandler, isHandlerActive] of state.actions) {
    if (isHandlerActive && actionHandler[event] !== null) {
      (actionHandler[event] as AnyContextualCallable).apply(actionHandler, rest);
    }
  }
}

/**
 * Determine which section to activate for an object.
 * In case of offline->online switch try to restore previous job.
 * In other cases try to get active scheme from ini config settings.
 *
 * @param object - client object to get object section
 * @param ini - ini file of the object
 * @param section - desired logics section
 * @returns section to activate
 */
export function getSectionToActivate(object: ClientObject, ini: IniFile, section: TSection): TSection {
  if (!ini.section_exist(section)) {
    return NIL;
  }

  const offlineObjectDescriptor: Optional<IStoredOfflineObject> = registry.offlineObjects.get(object.id());

  /**
   * If offline object detected, try to continue previous jon on online switch.
   */
  if (offlineObjectDescriptor?.activeSection) {
    const sectionToRetry: TSection = offlineObjectDescriptor.activeSection;

    offlineObjectDescriptor.activeSection = null;

    if (ini.section_exist(sectionToRetry)) {
      return sectionToRetry;
    }
  }

  const activeSectionCond: Optional<IBaseSchemeLogic> = readIniConditionList(ini, section, "active");

  if (activeSectionCond) {
    const section: Optional<TSection> = pickSectionFromCondList(registry.actor, object, activeSectionCond.condlist);

    // todo: Log also ini file path for simplicity of debug?
    assert(section, "'%s' => '%s', 'active' field has no conditionless else clause.", object.name(), section);

    return section;
  } else {
    return NIL;
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activateSchemeBySection(
  object: ClientObject,
  ini: IniFile,
  section: TSection,
  additional: Optional<string>,
  loading: boolean
): void {
  logger.info("Activate scheme:", object.name(), section, additional);

  assertDefined(loading, "scheme/logic: activateBySection: loading field is null, true || false expected.");

  const objectId: TNumberId = object.id();

  if (!loading) {
    registry.objects.get(objectId).activation_time = time_global();
    registry.objects.get(objectId).activation_game_time = game.get_game_time();
  }

  if (section === NIL) {
    registry.objects.get(objectId).overrides = null;
    resetObjectGenericSchemesOnSectionSwitch(object, EScheme.NIL, NIL);
    registry.objects.get(objectId).active_section = null;
    registry.objects.get(objectId).active_scheme = null;

    return;
  }

  if (section === null) {
    const currentSmartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    assert(currentSmartTerrain, "scheme/logic: activate_by_section: section is NIL && NPC !in smart.");

    const job: ISmartTerrainJob = currentSmartTerrain.getJob(objectId)!;

    section = job.section;
  }

  assert(ini.section_exist(section), "'%s': activate_by_section section '%s' does not exist.", object.name(), section);

  const scheme: Optional<EScheme> = getSchemeFromSection(section);

  assert(scheme, "object '%s': unable to determine scheme name from section name '%s'", object.name(), section);

  registry.objects.get(objectId).overrides = getObjectConfigOverrides(ini, section, object);

  resetObjectGenericSchemesOnSectionSwitch(object, scheme, section);

  const schemeImplementation: Optional<TAbstractSchemeConstructor> = registry.schemes.get(scheme);

  assert(schemeImplementation, "core/logic: scheme '%s' is !registered in modules.script", scheme);

  logger.info("Set active scheme:", scheme, "->", object.name(), section, additional);

  schemeImplementation.activate(object, ini, scheme, section as TSection, additional);

  registry.objects.get(objectId).active_section = section;
  registry.objects.get(objectId).active_scheme = scheme;

  // todo: Unify activate and reset events.
  if (registry.objects.get(objectId).schemeType === ESchemeType.STALKER) {
    sendToNearestAccessibleVertex(object, object.level_vertex_id());
    emitSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.ACTIVATE_SCHEME, loading, object);
  } else {
    emitSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.RESET_SCHEME, loading, object);
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function configureObjectSchemes(
  object: ClientObject,
  ini: IniFile,
  iniFilename: TName,
  schemeType: ESchemeType,
  sectionLogic: TSection,
  gulagName: Optional<TName>
): IniFile {
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  // Deactivate previous scheme section.
  if (state.active_section) {
    emitSchemeEvent(object, state[state.active_scheme!]!, ESchemeEvent.DEACTIVATE, object);
  }

  let actualIni: IniFile;
  let actualIniFilename: TName;

  if (!ini.section_exist(sectionLogic)) {
    if (gulagName === "") {
      actualIniFilename = iniFilename;
      actualIni = ini;
    } else {
      abort(
        "ERROR: object '%s': unable to find section '%s' in '%s'",
        object.name(),
        sectionLogic,
        tostring(iniFilename)
      );
    }
  } else {
    const filename: Optional<TName> = readIniString(ini, sectionLogic, "cfg", false, "");

    if (filename !== null) {
      actualIniFilename = filename;
      actualIni = new ini_file(filename);

      assert(
        actualIni.section_exist(sectionLogic),
        "object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ",
        object.name(),
        filename
      );

      return configureObjectSchemes(object, actualIni, actualIniFilename, schemeType, sectionLogic, gulagName);
    } else {
      if (schemeType === ESchemeType.STALKER || schemeType === ESchemeType.MONSTER) {
        const currentSmart: Optional<SmartTerrain> = getObjectSmartTerrain(object);

        if (currentSmart !== null) {
          const job: any = currentSmart.getJob(objectId);

          if (job) {
            state.job_ini = job.ini_path;
          } else {
            state.job_ini = null;
          }
        }
      }

      actualIniFilename = iniFilename;
      actualIni = ini;
    }
  }

  disableObjectBaseSchemes(object, schemeType);
  enableObjectGenericSchemes(actualIni, object, schemeType, sectionLogic);

  state.active_section = null;
  state.active_scheme = null;
  state.gulag_name = gulagName;

  state.schemeType = schemeType;
  state.ini = actualIni;
  state.ini_filename = actualIniFilename;
  state.section_logic = sectionLogic;

  if (schemeType === ESchemeType.STALKER) {
    const tradeIni: TPath = readIniString(
      actualIni,
      sectionLogic,
      "trade",
      false,
      "",
      "misc\\trade\\trade_generic.ltx"
    );

    TradeManager.getInstance().initForObject(object, tradeIni);
    spawnDefaultObjectItems(object, state);
  }

  return state.ini;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function enableObjectGenericSchemes(
  ini: IniFile,
  object: ClientObject,
  schemeType: ESchemeType,
  section: TSection
): void {
  switch (schemeType) {
    case ESchemeType.STALKER: {
      registry.schemes.get(EScheme.DANGER).activate(object, ini, EScheme.DANGER, "danger");
      registry.schemes.get(EScheme.GATHER_ITEMS).activate(object, ini, EScheme.GATHER_ITEMS, "gather_items");

      const combatSection: TSection = readIniString(ini, section, "on_combat", false, "");

      registry.schemes.get(EScheme.COMBAT).activate(object, ini, EScheme.COMBAT, combatSection);

      resetObjectInvulnerability(object);

      const infoSection: Optional<TSection> = readIniString(ini, section, "info", false, "");

      if (infoSection !== null) {
        setObjectInfo(object, ini, infoSection);
      }

      const hitSection: Optional<string> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        registry.schemes.get(EScheme.HIT).activate(object, ini, EScheme.HIT, hitSection);
      }

      /*
       * Originally unused.
       *
      const actor_dialogs_section = getConfigString(ini, section, "actor_dialogs", npc, false, "");

      if (actor_dialogs_section) {
        ActionSchemeMeet.set_actor_dialogs(npc, ini, "actor_dialogs", actor_dialogs_section);
      }
     */

      const woundedSection: TSection = readIniString(ini, section, "wounded", false, "");

      // todo: null can be replaced with actual section.
      registry.schemes.get(EScheme.WOUNDED).activate(object, ini, EScheme.WOUNDED, woundedSection);
      registry.schemes.get(EScheme.ABUSE).activate(object, ini, EScheme.ABUSE, section);
      registry.schemes
        .get(EScheme.HELP_WOUNDED)
        .activate(object, ini, EScheme.HELP_WOUNDED, null as unknown as TSection);
      registry.schemes
        .get(EScheme.CORPSE_DETECTION)
        .activate(object, ini, EScheme.CORPSE_DETECTION, null as unknown as TSection);

      const meetSection: TSection = readIniString(ini, section, "meet", false, "");

      registry.schemes.get(EScheme.MEET).activate(object, ini, EScheme.MEET, meetSection);

      const deathSection: TSection = readIniString(ini, section, "on_death", false, "");

      registry.schemes.get(EScheme.DEATH).activate(object, ini, EScheme.DEATH, deathSection);
      // todo: null can be replaced with actual section.
      registry.schemes
        .get(EScheme.COMBAT_IGNORE)
        .activate(object, ini, EScheme.COMBAT_IGNORE, null as unknown as TSection);
      // todo: null can be replaced with actual section.
      registry.schemes.get(EScheme.REACH_TASK).activate(object, ini, EScheme.REACH_TASK, null as unknown as TSection);

      return;
    }

    case ESchemeType.MONSTER: {
      const combatSection: Optional<TSection> = readIniString(ini, section, "on_combat", false, "");

      if (combatSection !== null) {
        registry.schemes.get(EScheme.MOB_COMBAT).activate(object, ini, EScheme.MOB_COMBAT, combatSection);
      }

      const deathSection: Optional<TSection> = readIniString(ini, section, "on_death", false, "");

      if (deathSection !== null) {
        registry.schemes.get(EScheme.MOB_DEATH).activate(object, ini, EScheme.MOB_DEATH, deathSection);
      }

      resetObjectInvulnerability(object);

      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        registry.schemes.get(EScheme.HIT).activate(object, ini, EScheme.HIT, hitSection);
      }

      registry.schemes
        .get(EScheme.COMBAT_IGNORE)
        .activate(object, ini, EScheme.COMBAT_IGNORE, null as unknown as TSection);

      return;
    }

    case ESchemeType.ITEM: {
      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        registry.schemes.get(EScheme.PH_ON_HIT).activate(object, ini, EScheme.PH_ON_HIT, hitSection);
      }

      return;
    }

    case ESchemeType.HELI: {
      const hitSection: Optional<TSection> = readIniString(ini, section, "on_hit", false, "");

      if (hitSection !== null) {
        registry.schemes.get(EScheme.HIT).activate(object, ini, EScheme.HIT, hitSection);
      }

      return;
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 */
export function initializeObjectSchemeLogic(
  object: ClientObject,
  state: IRegistryObjectState,
  isLoaded: boolean,
  actor: ClientObject,
  schemeType: ESchemeType
): void {
  logger.info("Initialize object:", object.name(), ESchemeType[schemeType], isLoaded);

  if (!isLoaded) {
    const iniFilename: TName = "<customdata>";
    const iniFile: IniFile = configureObjectSchemes(
      object,
      getObjectLogicIniConfig(object, iniFilename),
      iniFilename,
      schemeType,
      "logic",
      ""
    );

    const section: TSection = getSectionToActivate(object, iniFile, "logic");

    activateSchemeBySection(object, iniFile, section, state.gulag_name, false);

    const relation: Optional<ERelation> = readIniString(iniFile, "logic", "relation", false, "") as ERelation;

    if (relation !== null) {
      switch (relation) {
        case ERelation.NEUTRAL:
          object.set_relation(EClientObjectRelation.NEUTRAL, registry.actor);
          break;
        case ERelation.ENEMY:
          object.set_relation(EClientObjectRelation.ENEMY, registry.actor);
          break;
        case ERelation.FRIEND:
          object.set_relation(EClientObjectRelation.FRIEND, registry.actor);
          break;
      }
    }

    const sympathy: Optional<TCount> = readIniNumber(iniFile, "logic", "sympathy", false);

    if (sympathy !== null) {
      object.set_sympathy(sympathy);
    }
  } else {
    const iniFilename: Optional<TName> = state.loaded_ini_filename;

    if (iniFilename !== null) {
      const iniFile: IniFile = configureObjectSchemes(
        object,
        getObjectLogicIniConfig(object, iniFilename),
        iniFilename,
        schemeType,
        state.loaded_section_logic as TSection,
        state.loaded_gulag_name
      );

      activateSchemeBySection(object, iniFile, state.loaded_active_section as TSection, state.loaded_gulag_name, true);
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function resetObjectGenericSchemesOnSectionSwitch(
  object: ClientObject,
  scheme: EScheme,
  section: TSection
): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state.schemeType === null) {
    return;
  }

  switch (state.schemeType) {
    case ESchemeType.STALKER: {
      registry.schemes.get(EScheme.MEET).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.HELP_WOUNDED).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.CORPSE_DETECTION).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.ABUSE).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.WOUNDED).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.DEATH).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.DANGER).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.GATHER_ITEMS).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.COMBAT_IGNORE).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.HEAR).reset(object, scheme, state, section);

      MapDisplayManager.getInstance().updateObjectMapSpot(object, scheme, state, section);

      resetObjectIgnoreThreshold(object, scheme, state, section);
      resetObjectInvulnerability(object);
      resetObjectGroup(object, state.ini!, section);
      initializeObjectTakeItemsEnabledState(object, scheme, state, section);
      initializeObjectCanSelectWeaponState(object, scheme, state, section);
      ObjectRestrictionsManager.activateForObject(object, section);

      return;
    }

    case ESchemeType.MONSTER: {
      scriptReleaseObject(object, ""); // ???
      if (object.clsid() === clsid.bloodsucker_s) {
        object.set_manual_invisibility(scheme !== EScheme.NIL);
      }

      registry.schemes.get(EScheme.COMBAT_IGNORE).reset(object, scheme, state, section);
      registry.schemes.get(EScheme.HEAR).reset(object, scheme, state, section);
      resetObjectInvulnerability(object);
      ObjectRestrictionsManager.activateForObject(object, section);

      return;
    }

    case ESchemeType.ITEM: {
      object.set_callback(callback.use_object, null);
      object.set_nonscript_usable(true);

      return;
    }
  }
}
