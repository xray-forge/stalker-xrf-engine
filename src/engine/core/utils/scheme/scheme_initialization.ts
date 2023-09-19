import { alife, ini_file } from "xray16";

import {
  CUSTOM_DATA,
  getObjectLogicIniConfig,
  IBaseSchemeState,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { TradeManager } from "@/engine/core/managers/trade/TradeManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { assert } from "@/engine/core/utils/assertion";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { ISmartTerrainJobDescriptor } from "@/engine/core/utils/job";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object/object_get";
import { spawnItemsForObject } from "@/engine/core/utils/object/object_spawn";
import { ERelation } from "@/engine/core/utils/relation";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/scheme_event";
import {
  activateSchemeBySection,
  enableObjectBaseSchemes,
  getSectionToActivate,
} from "@/engine/core/utils/scheme/scheme_logic";
import { disableObjectBaseSchemes } from "@/engine/core/utils/scheme/scheme_setup";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  AlifeSimulator,
  ClientObject,
  EClientObjectRelation,
  EScheme,
  ESchemeEvent,
  ESchemeType,
  IniFile,
  Optional,
  ServerCreatureObject,
  TCount,
  TName,
  TPath,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "scheme" });

/**
 * Configure object schemes and get ini config describing object scripts.
 *
 * @param object - target client object
 * @param ini - ini file containing object spawn or job info
 * @param iniName - ini file name
 * @param schemeType - object scheme type
 * @param logicsSection - section describing object initial logic
 * @param smartTerrainName - object smart terrain name
 * @returns ini file containing object logics
 */
export function configureObjectSchemes(
  object: ClientObject,
  ini: IniFile,
  iniName: TName,
  schemeType: ESchemeType,
  logicsSection: TSection,
  smartTerrainName: Optional<TName>
): IniFile {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  // Deactivate previous scheme section.
  if (state.activeSection) {
    emitSchemeEvent(object, state[state.activeScheme as EScheme] as IBaseSchemeState, ESchemeEvent.DEACTIVATE, object);
  }

  let actualIni: IniFile;
  let actualIniFilename: TName;

  if (ini.section_exist(logicsSection)) {
    // Read target configuration object in a recursive way and then `configureObjectSchemes` with final ini file.
    const filename: Optional<TName> = readIniString(ini, logicsSection, "cfg", false);

    // Read ini file if section `cfg` exists and load it.
    if (filename) {
      actualIniFilename = filename;
      actualIni = new ini_file(filename);

      assert(
        actualIni.section_exist(logicsSection),
        "object '%s' configuration file [%s] !FOUND || section [logic] isn't assigned ",
        object.name(),
        filename
      );

      return configureObjectSchemes(object, actualIni, actualIniFilename, schemeType, logicsSection, smartTerrainName);
    } else {
      if (schemeType === ESchemeType.STALKER || schemeType === ESchemeType.MONSTER) {
        const currentSmart: Optional<SmartTerrain> = getObjectSmartTerrain(object);

        if (currentSmart) {
          const job: Optional<ISmartTerrainJobDescriptor> = currentSmart.getJobByObjectId(object.id());

          state.jobIni = job?.iniPath as Optional<TPath>;
        }
      }

      actualIniFilename = iniName;
      actualIni = ini;
    }
  } else {
    assert(
      smartTerrainName === "",
      "Object '%s': unable to find section '%s' in '%s' and has no assigned smart terrain.",
      object.name(),
      logicsSection,
      iniName
    );

    actualIniFilename = iniName;
    actualIni = ini;
  }

  disableObjectBaseSchemes(object, schemeType);
  enableObjectBaseSchemes(object, actualIni, schemeType, logicsSection);

  state.activeSection = null;
  state.activeScheme = null;
  state.smartTerrainName = smartTerrainName;
  state.schemeType = schemeType;
  state.sectionLogic = logicsSection;
  state.ini = actualIni;
  state.iniFilename = actualIniFilename;

  // todo: Move to separate activation methods?
  if (schemeType === ESchemeType.STALKER) {
    const tradeIniPath: TPath = readIniString(
      actualIni,
      logicsSection,
      "trade",
      false,
      null,
      logicsConfig.TRADE.DEFAULT_TRADE_LTX_PATH
    );

    TradeManager.getInstance().initializeForObject(object, tradeIniPath);

    initializeObjectSectionItems(object, state);
  }

  return state.ini;
}

/**
 * todo; Add tests
 * todo; Add tests
 * todo; Add tests
 *
 * @param object - target client object to setup logic
 * @param state - target object registry state
 * @param schemeType - target object active scheme type
 * @param isLoaded - whether object is initialized after game load
 */
export function setupObjectSmartJobsAndLogicOnSpawn(
  object: ClientObject,
  state: IRegistryObjectState,
  schemeType: ESchemeType,
  isLoaded: boolean
): void {
  // logger.info("Setup smart terrain logic on spawn:", object.name(), schemeType);

  const alifeSimulator: Optional<AlifeSimulator> = alife();
  const serverObject: Optional<ServerCreatureObject> = alife()!.object(object.id());

  if (
    alifeSimulator === null ||
    serverObject === null ||
    serverObject.m_smart_terrain_id === null ||
    serverObject.m_smart_terrain_id === MAX_U16
  ) {
    return initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }

  const smartTerrain: SmartTerrain = alifeSimulator.object(serverObject.m_smart_terrain_id) as SmartTerrain;
  const needSetupLogic: boolean = !isLoaded && smartTerrain.objectJobDescriptors.get(object.id())?.isBegun === true;

  if (needSetupLogic) {
    smartTerrain.setupObjectJobLogic(object);
  } else {
    initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }
}

/**
 * Initialize object scheme logics on object logics change/load/spawn.
 * Called on first object update or when smart terrain assignments change and object has to get new logic.
 *
 * @param object - target client object
 * @param state - target object registry state
 * @param isLoading - whether initialization is happening on object load
 * @param schemeType - type of object schemes applied
 */
export function initializeObjectSchemeLogic(
  object: ClientObject,
  state: IRegistryObjectState,
  isLoading: boolean,
  schemeType: ESchemeType
): void {
  logger.format("Initialize object scheme logic: '%s' %s'", object.name(), isLoading);

  if (isLoading) {
    const loadingIniFilename: Optional<TName> = state.loadedIniFilename;

    if (loadingIniFilename) {
      const iniFile: IniFile = configureObjectSchemes(
        object,
        getObjectLogicIniConfig(object, loadingIniFilename),
        loadingIniFilename,
        schemeType,
        state.loadedSectionLogic as TSection,
        state.loadedSmartTerrainName
      );

      activateSchemeBySection(
        object,
        iniFile,
        state.loadedActiveSection as TSection,
        state.loadedSmartTerrainName,
        true
      );
    }
  } else {
    const iniFile: IniFile = configureObjectSchemes(
      object,
      getObjectLogicIniConfig(object, CUSTOM_DATA),
      CUSTOM_DATA,
      schemeType,
      "logic",
      ""
    );

    const section: TSection = getSectionToActivate(object, iniFile, "logic");

    activateSchemeBySection(object, iniFile, section, state.smartTerrainName, false);

    const relation: Optional<ERelation> = readIniString(iniFile, "logic", "relation", false) as ERelation;

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

    const sympathy: Optional<TCount> = readIniNumber(iniFile, "logic", "sympathy", false);

    if (sympathy !== null) {
      object.set_sympathy(sympathy);
    }
  }
}

/**
 * Spawn object items on logics section change for an object.
 * Allows giving items to objects on specific logics activation.
 *
 * @param object - target client object
 * @param state - object registry state
 */
export function initializeObjectSectionItems(object: ClientObject, state: IRegistryObjectState): void {
  const spawnItemsSection: Optional<TSection> = readIniString(state.ini, state.sectionLogic, "spawn", false);

  if (spawnItemsSection === null) {
    return;
  }

  logger.info("Initialize section spawn items for object:", object.name());

  const itemsToSpawn: LuaTable<TInventoryItem, TCount> = new LuaTable();
  const itemSectionsCount: TCount = state.ini.line_count(spawnItemsSection);

  // todo: Probably do everything in one loop? The only problem is duplicated sections in such case.
  for (const it of $range(0, itemSectionsCount - 1)) {
    const [, id, value] = state.ini.r_line(spawnItemsSection, it, "", "");

    itemsToSpawn.set(id as TInventoryItem, value === "" ? 1 : (tonumber(value) as TCount));
  }

  for (const [id, count] of itemsToSpawn) {
    if (object.object(id) === null) {
      spawnItemsForObject(object, id, count);
    }
  }
}
