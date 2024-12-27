import { ini_file } from "xray16";

import { ESimulationTerrainRole, ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/types";
import { initializeLevelSimulationGroupIds } from "@/engine/core/managers/simulation/utils/simulation_ini";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { getTableValuesAsSet } from "@/engine/core/utils/table";
import type { IniFile, LuaArray, TName, TNumberId } from "@/engine/lib/types";

export const SIMULATION_LTX: IniFile = new ini_file("managers\\simulation\\simulation.ltx");
export const GAME_MAPS_SINGLE_LTX: IniFile = new ini_file("game\\game_maps_single.ltx");
export const SIMULATION_OBJECTS_PROPERTIES_LTX: IniFile = new ini_file(
  "managers\\simulation\\simulation_objects_props.ltx"
);

export const simulationConfig = {
  ALIFE_DISTANCE_NEAR: 150,
  ALIFE_DAY_START_HOUR: 6,
  ALIFE_DAY_END_HOUR: 19,
  IS_SIMULATION_INITIALIZED: false,
  TERRAINS: new LuaTable<TName, SmartTerrain>(),
  TERRAIN_DESCRIPTORS: new LuaTable<TNumberId, ISmartTerrainDescriptor>(),
  SQUADS: new LuaTable<TNumberId, Squad>(),
  // Squads assigned to smart terrains before initialization of terrains.
  TEMPORARY_ASSIGNED_SQUADS: new LuaTable<TNumberId, LuaArray<Squad>>(),
  /**
   * Unique identifiers to group simulation groups by level.
   */
  GROUP_ID_BY_LEVEL_NAME: initializeLevelSimulationGroupIds(GAME_MAPS_SINGLE_LTX),
  /**
   * Set of valid roles used for simulation terrains.
   * Limiting options and validating configuration of game data.
   */
  VALID_SMART_TERRAINS_SIMULATION_ROLES: getTableValuesAsSet(ESimulationTerrainRole),
};
