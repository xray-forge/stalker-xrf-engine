import { assert } from "@/engine/core/utils/assertion";
import { readIniNumber } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableKeys } from "@/engine/core/utils/table";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { IniFile, LuaArray, Optional, TName, TNumberId } from "@/engine/lib/types";

const log: LuaLogger = new LuaLogger($filename);

/**
 * Assign simulation group IDs for levels based on data from ini file.
 * Try to assign placeholder IDs if group is not defined in ini file.
 *
 * @param ini - target ini file to read data from
 * @returns map of simulation group IDs by level name
 */
export function initializeLevelSimulationGroupIds(ini: IniFile): LuaTable<TName, TNumberId> {
  log.info("Initialize level simulation group IDs from: '%s', '%s' levels", ini.fname(), table.size(levels));

  const availableLevels: LuaArray<TLevel> = getTableKeys($fromObject(levels));
  const usedGroupIds: LuaTable<TNumberId, TName> = new LuaTable();
  const groupIdsByLevels: LuaTable<TName, TNumberId> = new LuaTable();

  let freeGroupId: TNumberId = 127;

  // Sort to make things more deterministic in terms of keys iteration / assigning ordered IDs.
  table.sort(availableLevels, (left, right) => left < right);

  for (const [, level] of availableLevels) {
    const simulationGroupId: Optional<TNumberId> = readIniNumber(ini, level, "simulation_group_id");
    const nextId: TNumberId = typeof simulationGroupId === "number" ? simulationGroupId : ++freeGroupId;

    // Maintain u8 boundaries / overflow.
    assert(
      nextId > 0 && nextId < MAX_U8,
      "[%s] Failed to assign level '%s' group id '%s', it is not in range [1:%s].",
      $filename,
      level,
      simulationGroupId,
      MAX_U8
    );

    // Avoid duplicates of simulation IDs.
    assert(
      !usedGroupIds.has(nextId),
      "[%s] Found duplicate group id '%s' usage for level '%s', '%s' already using it",
      $filename,
      nextId,
      level,
      usedGroupIds.get(nextId)
    );

    usedGroupIds.set(nextId, level);
    groupIdsByLevels.set(level, nextId);
  }

  return groupIdsByLevels;
}
