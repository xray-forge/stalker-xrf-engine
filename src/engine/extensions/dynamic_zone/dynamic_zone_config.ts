import { IniFile } from "xray16/alias";
import { abort, Nillable, TCount, TDistance, TDuration, TName, TRate } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { readIniNumber } from "@/engine/core/ini";

/**
 * Settings of the dynamic zone extension, read from its `main.ltx`.
 */
export interface IDynamicZoneConfig {
  // Game seconds a respawn point waits between respawn attempts.
  respawnIdle: TDuration;
  // Respawn wait of single smart terrains, by name.
  respawnIdleByTerrain: LuaTable<TName, TDuration>;
  // Factors scaling how many squads a respawn section may have alive.
  stalkerRespawnFactor: TRate;
  monsterRespawnFactor: TRate;
  // Distance from a base terrain within which squads are not hunted and do not fight offline.
  baseProtectionRadius: TDistance;
  // Distance within which enemy offline squads fight.
  combatDistance: TDistance;
  // Real seconds between offline battle rounds.
  combatScanInterval: TDuration;
  // Share of a squad's power it deals as damage in a round: the base plus up to the spread at random.
  combatHitBase: TRate;
  combatHitSpread: TRate;
  // Power of a mutant per rank point, a stalker's power being its rank.
  monsterRankFactor: TRate;
  // Rank a stalker gains for a kill per point of power its squad struck with, and the most its commander gains.
  killRankGain: TRate;
  commanderRankGain: TCount;
  // Bodies offline battles leave before the oldest offline ones are released.
  corpseLimit: TCount;
}

/**
 * @param ini - The extension's `main.ltx`.
 * @returns Settings of the extension, its defaults where the file sets nothing.
 */
export function readDynamicZoneConfig(ini: IniFile): IDynamicZoneConfig {
  const respawnIdleByTerrain: LuaTable<TName, TDuration> = new LuaTable();

  if (ini.section_exist("respawn_idle")) {
    const count: TCount = ini.line_count("respawn_idle");

    for (const index of $range(0, count - 1)) {
      const [, terrain, value] = ini.r_line("respawn_idle", index, "", "");
      const idle: Nillable<TDuration> = tonumber(value);

      if ($isNil(idle)) {
        abort("Dynamic zone 'respawn_idle' of '%s' is not a number of game seconds: '%s'.", terrain, value);
      }

      respawnIdleByTerrain.set(terrain, idle);
    }
  }

  return {
    respawnIdle: readIniNumber(ini, "respawn", "idle", false, 86_400),
    respawnIdleByTerrain,
    stalkerRespawnFactor: readIniNumber(ini, "population", "stalker_factor", false, 0.5),
    monsterRespawnFactor: readIniNumber(ini, "population", "monster_factor", false, 0.75),
    baseProtectionRadius: readIniNumber(ini, "hunting", "base_protection_radius", false, 75),
    combatDistance: readIniNumber(ini, "combat", "distance", false, 20),
    combatScanInterval: readIniNumber(ini, "combat", "scan_interval", false, 30),
    combatHitBase: readIniNumber(ini, "combat", "hit_base", false, 0.4),
    combatHitSpread: readIniNumber(ini, "combat", "hit_spread", false, 0.2),
    monsterRankFactor: readIniNumber(ini, "combat", "monster_rank_factor", false, 8),
    killRankGain: readIniNumber(ini, "combat", "kill_rank_gain", false, 0.004),
    commanderRankGain: readIniNumber(ini, "combat", "commander_rank_gain", false, 2),
    corpseLimit: readIniNumber(ini, "combat", "corpse_limit", false, 50),
  };
}
