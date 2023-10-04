import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { readRanksList } from "@/engine/core/utils/ranks";

/**
 * Read ranks from ini files and setup registry state.
 */
export function registerRanks(): void {
  registry.ranks.stalker = readRanksList(SYSTEM_INI, "game_relations", "rating");
  registry.ranks.maxStalkerRank = registry.ranks.stalker.get(registry.ranks.stalker.length());
  registry.ranks.monster = readRanksList(SYSTEM_INI, "game_relations", "monster_rating");
  registry.ranks.maxMonsterRank = registry.ranks.monster.get(registry.ranks.monster.length());
  registry.ranks.isInitialized = true;
}
