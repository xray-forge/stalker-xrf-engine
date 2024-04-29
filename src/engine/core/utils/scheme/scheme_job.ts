import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { IObjectJobState, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { assert } from "@/engine/core/utils/assertion";
import { getSchemeFromSection } from "@/engine/core/utils/ini";
import { configureObjectSchemes, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme/scheme_initialization";
import { activateSchemeBySection, getSectionToActivate } from "@/engine/core/utils/scheme/scheme_logic";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { ESchemeType, GameObject, IniFile, Optional, ServerCreatureObject, TName, TSection } from "@/engine/lib/types";

/**
 * @param object - game object to setup logic
 * @param state - target object registry state
 * @param schemeType - target object active scheme type
 * @param isLoaded - whether object is initialized after game load
 */
export function setupObjectLogicsOnSpawn(
  object: GameObject,
  state: IRegistryObjectState,
  schemeType: ESchemeType,
  isLoaded: boolean
): void {
  // logger.format("Setup smart terrain logic on spawn: %s %s", object.name(), schemeType);

  const serverObject: Optional<ServerCreatureObject> = registry.simulator?.object(object.id());

  if (!serverObject || !serverObject.m_smart_terrain_id || serverObject.m_smart_terrain_id === MAX_ALIFE_ID) {
    return initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }

  const terrain: SmartTerrain = registry.simulator.object(serverObject.m_smart_terrain_id) as SmartTerrain;
  const needSetupLogic: boolean = !isLoaded && terrain.objectJobDescriptors.get(object.id())?.isBegun === true;

  if (needSetupLogic) {
    setupSmartTerrainObjectJobLogic(terrain, object);
  } else {
    initializeObjectSchemeLogic(object, state, isLoaded, schemeType);
  }
}

/**
 * Initialize and setup object job logics in smart terrain based on currently active job.
 * If object job descriptor is updated and linked, logics schemas will be activated as needed.
 *
 * @param terrain - target smart terrain to setup logic in
 * @param object - game object to setup logics
 */
export function setupSmartTerrainObjectJobLogic(terrain: SmartTerrain, object: GameObject): void {
  // logger.format("Setup logic: %s %s", this.name(), object.name());

  const objectJob: IObjectJobState = terrain.objectJobDescriptors.get(object.id());
  const job: ISmartTerrainJobDescriptor = terrain.jobs.get(objectJob.jobId);
  const ltx: IniFile = job.iniFile ?? terrain.jobsConfig;
  const ltxName: TName = job.iniPath ?? terrain.jobsConfigName;

  configureObjectSchemes(object, ltx, ltxName, objectJob.schemeType, job.section, terrain.name());

  const section: TSection = getSectionToActivate(object, ltx, job.section);

  assert(
    getSchemeFromSection(section),
    "Smart terrain '%s' setup logics for '%s' section '%s', don't use section 'nil'.",
    terrain.name(),
    object.name(),
    section
  );

  activateSchemeBySection(object, ltx, section, terrain.name(), false);
}
