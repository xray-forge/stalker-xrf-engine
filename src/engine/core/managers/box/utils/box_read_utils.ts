import { level } from "xray16";

import { boxConfig, PH_BOX_GENERIC_LTX } from "@/engine/core/managers/box";
import { abort } from "@/engine/core/utils/assertion";
import { parseNumbersList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { LuaArray, Optional, TCount, TName, TRate, TSection } from "@/engine/lib/types";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * Initialize list of items drop based on current difficulty and level.
 */
export function initializeDropBoxesLoot(): void {
  let levelName: TName = level.name();

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

  if (!PH_BOX_GENERIC_LTX.section_exist(levelName)) {
    levelName = "default";
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
