import { Nillable, TCount, TName, TStringId } from "xray16/lib";

import { TWeapon } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";

/**
 * Key in portable store indicating count of used anabiotics.
 */
export const PS_ANABIOTICS_USED: TStringId = "anabiotics_used";

/**
 * Interface describing actor statistics.
 */
export interface IActorStatistics {
  surgesCount: TCount;
  completedTasksCount: TCount;
  killedMonstersCount: TCount;
  killedStalkersCount: TCount;
  favoriteWeapon: Nillable<TWeapon>;
  bestKilledMonsterRank: TCount;
  bestKilledMonster: Nillable<TMonster>;
  collectedTreasuresCount: TCount;
  /**
   * List of collected artefacts sections to track what was found and what not.
   */
  collectedArtefacts: LuaTable<TName, boolean>;
  collectedArtefactsCount: TCount;
}
