import { SmartTerrain, Squad } from "@/engine/core/objects";
import { TCommunity } from "@/engine/lib/constants/communities";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { TCount, TNumberId } from "@/engine/lib/types";

/**
 * Smart terrain details descriptor for alife participation.
 */
export interface ISmartTerrainDescriptor {
  smartTerrain: SmartTerrain;
  assignedSquads: LuaTable<TNumberId, Squad>;
  stayingSquadsCount: TCount;
}

/**
 * Descriptor of faction participating in alife.
 */
export interface ISimulationFactionDescriptor {
  id: TNumberId;
  name: TCommunity;
  isCommunity: boolean;
}

/**
 * todo: Remove / use strings / solve it
 */
export const groupIdByLevelName: LuaTable<TLevel, TNumberId> = $fromObject({
  [levels.zaton]: 1,
  [levels.pripyat]: 2,
  [levels.jupiter]: 3,
  [levels.labx8]: 4,
  [levels.jupiter_underground]: 5,
});
