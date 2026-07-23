import { IniFile } from "xray16/alias";
import { assert, LuaArray, MAX_U8, Nillable, TName, TNumberId } from "xray16/lib";
import { $filename, $fromObject, $isNil } from "xray16/macros";

import { levels, TLevel } from "@/engine/constants/levels";
import { readIniNumber } from "@/engine/core/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableKeys } from "@/engine/core/utils/table";

const log: LuaLogger = new LuaLogger($filename);

/**
 * Assign simulation group IDs for levels based on data from ini file.
 * Try to assign placeholder IDs if group is not defined in ini file.
 *
 * @param ini - Target ini file to read data from.
 * @returns Map of simulation group IDs by level name.
 */
export function initializeLevelSimulationGroupIds(ini: IniFile): LuaTable<TName, TNumberId> {
  log.info("Initialize level simulation group IDs, %s levels", table.size(levels));

  const availableLevels: LuaArray<TLevel> = getTableKeys($fromObject(levels));
  const usedGroupIds: LuaTable<TNumberId, TName> = new LuaTable();
  const groupIdsByLevels: LuaTable<TName, TNumberId> = new LuaTable();
  const configuredGroupIdsByLevel: LuaTable<TLevel, TNumberId> = new LuaTable();

  let freeGroupId: TNumberId = 127;

  // Sort to make things more deterministic in terms of keys iteration / assigning ordered IDs.
  table.sort(availableLevels, (left, right) => left < right);

  // Reserve explicit ids before allocating fallbacks so a missing early level cannot claim an id configured later.
  for (const [, level] of availableLevels) {
    const simulationGroupId: Nillable<TNumberId> = readIniNumber(ini, level, "simulation_group_id");

    if (typeof simulationGroupId !== "number") {
      continue;
    }

    // Maintain u8 boundaries / overflow.
    assert(
      simulationGroupId > 0 && simulationGroupId < MAX_U8,
      "[%s] Failed to assign level '%s' group id '%s', it is not in range [1:%s].",
      $filename,
      level,
      simulationGroupId,
      MAX_U8
    );

    // Avoid duplicates of simulation IDs.
    assert(
      !usedGroupIds.has(simulationGroupId),
      "[%s] Found duplicate group id '%s' usage for level '%s', '%s' already using it",
      $filename,
      simulationGroupId,
      level,
      usedGroupIds.get(simulationGroupId)
    );

    usedGroupIds.set(simulationGroupId, level);
    configuredGroupIdsByLevel.set(level, simulationGroupId);
  }

  for (const [, level] of availableLevels) {
    let nextId: Nillable<TNumberId> = configuredGroupIdsByLevel.get(level);

    if ($isNil(nextId)) {
      do {
        freeGroupId += 1;
      } while (usedGroupIds.has(freeGroupId));

      nextId = freeGroupId;

      assert(
        nextId > 0 && nextId < MAX_U8,
        "[%s] Failed to assign level '%s' group id '%s', it is not in range [1:%s].",
        $filename,
        level,
        nextId,
        MAX_U8
      );

      usedGroupIds.set(nextId, level);
    }

    groupIdsByLevels.set(level, nextId);
  }

  return groupIdsByLevels;
}
