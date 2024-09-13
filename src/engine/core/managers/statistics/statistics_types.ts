import { TWeapon } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";
import { Optional, TCount, TName, TStringId } from "@/engine/lib/types";

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
  favoriteWeapon: Optional<TWeapon>;
  bestKilledMonsterRank: TCount;
  bestKilledMonster: Optional<TMonster>;
  collectedTreasuresCount: TCount;
  /**
   * List of collected artefacts sections to track what was found and what not.
   */
  collectedArtefacts: LuaTable<TName, boolean>;
  collectedArtefactsCount: TCount;
}
