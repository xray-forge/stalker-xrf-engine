import { level } from "xray16";

import { IBoxDropProbabilityDescriptor } from "@/engine/core/managers/box/box_types";
import { boxConfig, PH_BOX_GENERIC_LTX } from "@/engine/core/managers/box/BoxConfig";
import { abort } from "@/engine/core/utils/assertion";
import { parseNumbersList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { spawnItemsAtPosition } from "@/engine/core/utils/spawn";
import { copyVector } from "@/engine/core/utils/vector";
import { TInventoryItem } from "@/engine/lib/constants/items";
import {
  GameObject,
  LuaArray,
  Optional,
  TCount,
  TDirection,
  TName,
  TProbability,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Initialize list of items drop based on current difficulty and level.
 */
export function initializeDropBoxesLoot(): void {
  let levelName: TName = level.name();

  if (!PH_BOX_GENERIC_LTX.section_exist(levelName)) {
    levelName = "default";
  }

  logger.format("Initialize box items at level: %s", levelName);

  for (const [, section] of boxConfig.LOOT_BOX_SECTIONS) {
    boxConfig.DROP_ITEMS_BY_SECTION.set(section, new LuaTable());

    if (PH_BOX_GENERIC_LTX.section_exist(section)) {
      const count: TCount = PH_BOX_GENERIC_LTX.line_count(section);

      for (const it of $range(0, count - 1)) {
        const [, id, value] = PH_BOX_GENERIC_LTX.r_line(section, it, "", "");

        boxConfig.DROP_ITEMS_BY_SECTION.get(section).set(id as TInventoryItem, 100 * (tonumber(value) as TRate));
      }
    }
  }

  for (const it of $range(0, PH_BOX_GENERIC_LTX.line_count(levelName) - 1)) {
    const [, id, value] = PH_BOX_GENERIC_LTX.r_line(levelName, it, "", "");

    boxConfig.DROP_RATE_BY_LEVEL.set(id, tonumber(value)!);
  }

  const itemCountSection: TSection = "item_count_" + level.get_game_difficulty();

  for (const it of $range(0, PH_BOX_GENERIC_LTX.line_count(itemCountSection) - 1)) {
    const [, section, value] = PH_BOX_GENERIC_LTX.r_line(itemCountSection, it, "", "");

    const nums: LuaArray<TCount> = parseNumbersList(value);

    if (nums.get(1) === null) {
      abort(
        "Error on [PH_BOX_GENERIC_LTX] loot declaration. Section [%s], line [%s].",
        itemCountSection,
        tostring(section)
      );
    }

    let min: TCount = nums.get(1);
    let max: Optional<TCount> = nums.get(2);

    if (max === null) {
      max = min;
    }

    if (!boxConfig.DROP_RATE_BY_LEVEL.get(section)) {
      boxConfig.DROP_RATE_BY_LEVEL.set(section, 0);
    }

    min = tonumber(min)! * boxConfig.DROP_RATE_BY_LEVEL.get(section);
    max = tonumber(max)! * boxConfig.DROP_RATE_BY_LEVEL.get(section);

    boxConfig.DROP_COUNT_BY_LEVEL.set(section, { min: min, max: max });
  }
}

/**
 * Spawn box loot items for provided game object.
 * Based on list of items provided as parameter.
 *
 * Specifics of this spawning is to place all items on top and minimize clipping (fuzz Y coordinate).
 * Also place item as not linked to any object.
 *
 * @param object - target object to spawn for
 * @param items - list of item section to check and try to spawn
 */
export function spawnLootForSections(object: GameObject, items: LuaTable<TSection, TProbability>): void {
  const [, gvid, lvid, position] = getObjectPositioning(object);

  const destination: Vector = copyVector(position);
  const baseline: TDirection = destination.y;

  for (const [section, probability] of items) {
    const descriptor: IBoxDropProbabilityDescriptor = boxConfig.DROP_COUNT_BY_LEVEL.get(section);
    const count: TCount = math.ceil(math.random(descriptor.min, descriptor.max));

    destination.y = baseline + math.random(0.2, 0.5);

    spawnItemsAtPosition(section, gvid, lvid, destination, count, probability);
  }
}
