import { ini_file } from "xray16";

import type { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import type { IniFile, LuaArray, TName, TNumberId } from "@/engine/lib/types";

export const SIMULATION_LTX: IniFile = new ini_file("managers\\simulation\\simulation.ltx");
export const SIMULATION_OBJECTS_PROPERTIES_LTX: IniFile = new ini_file(
  "managers\\simulation\\simulation_objects_props.ltx"
);

export const simulationConfig = {
  IS_SIMULATION_INITIALIZED: false,
  TERRAINS: new LuaTable<TName, SmartTerrain>(),
  TERRAIN_DESCRIPTORS: new LuaTable<TNumberId, ISmartTerrainDescriptor>(),
  SQUADS: new LuaTable<TNumberId, Squad>(),
  // Squads assigned to smart terrains before initialization of terrains.
  TEMPORARY_ASSIGNED_SQUADS: new LuaTable<TNumberId, LuaArray<Squad>>(),
};
