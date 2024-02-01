import { clsid } from "xray16";

import { IRankDescriptor, registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";
import { classIds } from "@/engine/lib/constants/class_ids";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  GameObject,
  IniFile,
  LuaArray,
  Optional,
  ServerMonsterAbstractObject,
  TClassId,
  TIndex,
  TName,
  TRate,
  TSection,
} from "@/engine/lib/types";

/**
 * Parses game ranks and caches list with them.
 *
 * @returns list of game ranks names
 */
export function readRanksList(ini: IniFile, section: TSection, field: TName): LuaArray<IRankDescriptor> {
  const list: LuaArray<IRankDescriptor> = new LuaTable();
  const data: LuaArray<string> = parseStringsList(
    string.format("%s,%s,%s", 0, readIniString(ini, section, field, true), MAX_U16)
  );

  let index: TIndex = 2;

  while (index < data.length()) {
    table.insert(list, {
      name: data.get(index),
      min: tonumber(data.get(index - 1)) as TRate,
      max: tonumber(data.get(index + 1)) as TRate,
    });

    index += 2;
  }

  return list;
}

/**
 * Get stalker rank descriptor by rank name.
 *
 * @param rank - name of rank to check
 * @returns descriptor of the rank
 */
export function getStalkerRankByName(rank: TName): IRankDescriptor {
  for (const [, descriptor] of registry.ranks.stalker) {
    if (descriptor.name === rank) {
      return descriptor;
    }
  }

  abort("Unknown stalker rank supplied for check: '%s'.", rank);
}

/**
 * Get stalker rank descriptor by rank value.
 *
 * @param value - value of rank points to check
 * @returns descriptor of the rank
 */
export function getStalkerRankByValue(value: TRate): IRankDescriptor {
  for (const [, descriptor] of registry.ranks.stalker) {
    if (value >= descriptor.min && value < descriptor.max) {
      return descriptor;
    }
  }

  return registry.ranks.maxStalkerRank;
}

/**
 * Get monster rank descriptor by rank value.
 *
 * @param value - value of rank points to check
 * @returns descriptor of the rank
 */
export function getMonsterRankByValue(value: TRate): IRankDescriptor {
  for (const [, descriptor] of registry.ranks.monster) {
    if (value >= descriptor.min && value < descriptor.max) {
      return descriptor;
    }
  }

  return registry.ranks.maxMonsterRank;
}

/**
 * Get monster rank descriptor by rank name.
 *
 * @param rank - name of rank to check
 * @returns descriptor of the rank
 */
export function getMonsterRankByName(rank: TName): IRankDescriptor {
  for (const [, descriptor] of registry.ranks.monster) {
    if (descriptor.name === rank) {
      return descriptor;
    }
  }

  abort("Unknown monster rank supplied for check: '%s'.", rank);
}

/**
 * Get next stalker rank descriptor based on current.
 *
 * @param rank - name of rank to check
 * @returns descriptor of the next rank
 */
export function getNextStalkerRank(rank: TName): IRankDescriptor {
  for (const [index, descriptor] of registry.ranks.stalker) {
    if (descriptor.name === rank && registry.ranks.stalker.get(index + 1)) {
      return registry.ranks.stalker.get(index + 1);
    }
  }

  return registry.ranks.maxStalkerRank;
}

/**
 * Get next monster rank descriptor based on current.
 *
 * @param rank - name of rank to check
 * @returns descriptor of the next rank
 */
export function getNextMonsterRank(rank: TName): IRankDescriptor {
  for (const [index, descriptor] of registry.ranks.monster) {
    if (descriptor.name === rank && registry.ranks.monster.get(index + 1)) {
      return registry.ranks.monster.get(index + 1);
    }
  }

  return registry.ranks.maxMonsterRank;
}

/**
 * @param object - game object to get rank descriptor for
 *
 * @returns game object rank descriptor
 */
export function getGameObjectRank(object: GameObject): Optional<IRankDescriptor> {
  const classId: TClassId = object.clsid();
  const objectRank: TRate = object.character_rank() ?? object.rank();

  return classIds.stalker.has(classId) || classId === clsid.trader
    ? getStalkerRankByValue(objectRank)
    : getMonsterRankByValue(objectRank);
}

/**
 * @param object - server object to get rank descriptor for
 *
 * @returns server object rank descriptor
 */
export function getServerObjectRank(object: ServerMonsterAbstractObject): Optional<IRankDescriptor> {
  const classId: TClassId = object.clsid();

  const a = classIds.stalker;

  return classIds.stalker.has(classId) || classId === clsid.trader
    ? getStalkerRankByValue(object.rank())
    : getMonsterRankByValue(object.rank());
}
