import { ini_file } from "xray16";
import { EGameObjectRelation, GameObject, IniFile } from "xray16/alias";
import { assert, Nillable, TCount, TName, TPath, TSection } from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { TInventoryItem } from "@/engine/constants/items";
import {
  CUSTOM_DATA,
  getManager,
  getObjectLogicIniConfig,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { readIniNumber, readIniString } from "@/engine/core/ini";
import { TradeManager } from "@/engine/core/managers/trade/TradeManager";
import { readObjectTradeIniPath } from "@/engine/core/managers/trade/utils/trade_init";
import { getTerrainJobByObjectId } from "@/engine/core/objects/smart_terrain/job/job_pick";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { emitSchemeEvent } from "@/engine/core/schemes/runtime/scheme_event";
import {
  activateSchemeBySection,
  enableObjectBaseSchemes,
  getSectionToActivate,
} from "@/engine/core/schemes/runtime/scheme_logic";
import { disableObjectBaseSchemes } from "@/engine/core/schemes/runtime/scheme_setup";
import { getActiveSchemeStateOptimistic, hasActiveScheme } from "@/engine/core/schemes/state";
import { ESchemeEvent, ESchemeType } from "@/engine/core/schemes/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectTerrain } from "@/engine/core/utils/position";
import { ERelation } from "@/engine/core/utils/relation";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";

const logger: LuaLogger = new LuaLogger($filename, { file: "scheme" });

/**
 * Configure object schemes and get ini config describing object scripts.
 *
 * @param object - Game object.
 * @param ini - Ini file containing object spawn or job info.
 * @param iniName - Ini file name.
 * @param schemeType - Object scheme type.
 * @param logicsSection - Section describing object initial logic.
 * @param smartTerrainName - Object smart terrain name.
 * @returns Ini file containing object logics.
 */
export function configureObjectSchemes(
  object: GameObject,
  ini: IniFile,
  iniName: TName,
  schemeType: ESchemeType,
  logicsSection: TSection,
  smartTerrainName: Nillable<TName>
): IniFile {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  // Deactivate previous scheme section.
  // todo: Is one check enough?
  if (state.activeSection && hasActiveScheme(state)) {
    emitSchemeEvent(getActiveSchemeStateOptimistic(state), ESchemeEvent.DEACTIVATE, object);
  }

  let actualIni: IniFile;
  let actualIniFilename: TName;

  if (ini.section_exist(logicsSection)) {
    // Read target configuration object in a recursive way and then `configureObjectSchemes` with final ini file.
    const filename: Nillable<TName> = readIniString(ini, logicsSection, "cfg", false);

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
        const currentSmart: Nillable<SmartTerrain> = getObjectTerrain(object);

        if (currentSmart) {
          state.jobIni = getTerrainJobByObjectId(currentSmart, object.id())?.iniPath as Nillable<TPath>;
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
  state.hasInvulnerabilityCache = false;
  state.invulnerabilityConditionList = null;
  state.invulnerabilitySection = null;

  // todo: Move to separate activation methods?
  if (schemeType === ESchemeType.STALKER) {
    getManager(TradeManager).initializeForObject(object, readObjectTradeIniPath(actualIni, logicsSection));

    initializeObjectSectionItems(object, state);
  }

  return state.ini;
}

/**
 * Initialize object scheme logics on object logics change/load/spawn.
 * Called on first object update or when smart terrain assignments change and object has to get new logic.
 *
 * @param object - Game object.
 * @param state - Target object registry state.
 * @param isLoading - Whether initialization is happening on object load.
 * @param schemeType - Type of object schemes applied.
 */
export function initializeObjectSchemeLogic(
  object: GameObject,
  state: IRegistryObjectState,
  isLoading: boolean,
  schemeType: ESchemeType
): void {
  logger.info("Initialize object scheme logic: '%s' %s'", object.name(), isLoading);

  if (isLoading) {
    const loadingIniFilename: Nillable<TName> = state.loadedIniFilename;

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

    const relation: Nillable<ERelation> = readIniString(iniFile, "logic", "relation", false) as ERelation;

    switch (relation) {
      case ERelation.NEUTRAL:
        object.set_relation(EGameObjectRelation.NEUTRAL, registry.actor);
        break;
      case ERelation.ENEMY:
        object.set_relation(EGameObjectRelation.ENEMY, registry.actor);
        break;
      case ERelation.FRIEND:
        object.set_relation(EGameObjectRelation.FRIEND, registry.actor);
        break;
    }

    const sympathy: Nillable<TCount> = readIniNumber(iniFile, "logic", "sympathy", false);

    if ($isNotNil(sympathy)) {
      object.set_sympathy(sympathy);
    }
  }
}

/**
 * Spawn object items on logics section change for an object.
 * Allows giving items to objects on specific logics activation.
 *
 * @param object - Game object.
 * @param state - Object registry state.
 */
export function initializeObjectSectionItems(object: GameObject, state: IRegistryObjectState): void {
  const spawnItemsSection: Nillable<TSection> = readIniString(state.ini, state.sectionLogic, "spawn", false);

  if ($isNil(spawnItemsSection)) {
    return;
  }

  logger.info("Initialize section spawn items for object: %s", object.name());

  const itemsToSpawn: LuaTable<TInventoryItem, TCount> = new LuaTable();
  const itemSectionsCount: TCount = state.ini.line_count(spawnItemsSection);

  // todo: Probably do everything in one loop? The only problem is duplicated sections in such case.
  for (const it of $range(0, itemSectionsCount - 1)) {
    const [, id, value] = state.ini.r_line(spawnItemsSection, it, "", "");

    itemsToSpawn.set(id as TInventoryItem, value === "" ? 1 : (tonumber(value) as TCount));
  }

  for (const [id, count] of itemsToSpawn) {
    if ($isNil(object.object(id))) {
      spawnItemsForObject(object, id, count);
    }
  }
}
