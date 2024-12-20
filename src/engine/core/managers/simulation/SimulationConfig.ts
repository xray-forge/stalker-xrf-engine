import { ini_file } from "xray16";

import { ESimulationTerrainRole, ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import type { IniFile, LuaArray, TName, TNumberId } from "@/engine/lib/types";

export const SIMULATION_LTX: IniFile = new ini_file("managers\\simulation\\simulation.ltx");
export const SIMULATION_OBJECTS_PROPERTIES_LTX: IniFile = new ini_file(
  "managers\\simulation\\simulation_objects_props.ltx"
);

/**
 * todo: Remove / use strings / simplify and make more scalable
 */
export const GROUP_ID_BY_LEVEL_NAME: LuaTable<TLevel, TNumberId> = $fromObject({
  [levels.zaton]: 1,
  [levels.pripyat]: 2,
  [levels.jupiter]: 3,
  [levels.labx8]: 4,
  [levels.jupiter_underground]: 5,
});

/**
 * Set of valid roles used for simulation terrains.
 * Limiting options and validating configuration of game data.
 */
export const VALID_SMART_TERRAINS_SIMULATION_ROLES: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
  [ESimulationTerrainRole.DEFAULT]: true,
  [ESimulationTerrainRole.BASE]: true,
  [ESimulationTerrainRole.SURGE]: true,
  [ESimulationTerrainRole.RESOURCE]: true,
  [ESimulationTerrainRole.TERRITORY]: true,
  [ESimulationTerrainRole.LAIR]: true,
});

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
};
