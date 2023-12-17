import { level } from "xray16";

import { PH_BOX_GENERIC_LTX } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base";
import { IBoxDropItemDescriptor, IBoxDropProbabilityDescriptor } from "@/engine/core/managers/box/box_types";
import { boxConfig } from "@/engine/core/managers/box/BoxConfig";
import { readBoxItemList } from "@/engine/core/managers/box/utils";
import { abort } from "@/engine/core/utils/assertion";
import { parseNumbersList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { TInventoryItem } from "@/engine/lib/constants/items";
import {
  GameObject,
  IniFile,
  LuaArray,
  Optional,
  TCount,
  TName,
  TProbability,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling boxes that may provide loot on destruction.
 */
export class BoxManager extends AbstractManager {
  public override initialize(): void {
    let levelName: TName = level.name();

    logger.format("Initialize box items at level: %s", levelName);

    for (const [, section] of boxConfig.LOOT_BOX_SECTIONS) {
      boxConfig.ITEMS_BY_BOX_SECTION.set(section, new LuaTable());

      if (PH_BOX_GENERIC_LTX.section_exist(section)) {
        const count: TCount = PH_BOX_GENERIC_LTX.line_count(section);

        for (const it of $range(0, count - 1)) {
          const [, id, value] = PH_BOX_GENERIC_LTX.r_line(section, it, "", "");

          boxConfig.ITEMS_BY_BOX_SECTION.get(section).set(id as TInventoryItem, 100 * (tonumber(value) as TRate));
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
      const [, id, value] = PH_BOX_GENERIC_LTX.r_line(itemCountSection, it, "", "");

      const nums: LuaArray<TCount> = parseNumbersList(value);

      if (nums.get(1) === null) {
        abort("Error on [PH_BOX_GENERIC_LTX] declaration. Section [%s], line [%s]", itemCountSection, tostring(id));
      }

      let min: TCount = nums.get(1);
      let max: TCount = nums.get(2);

      if (max === null) {
        max = min;
      }

      if (!boxConfig.DROP_RATE_BY_LEVEL.get(id) === null) {
        boxConfig.DROP_RATE_BY_LEVEL.set(id, 0);
      }

      min = tonumber(min)! * boxConfig.DROP_RATE_BY_LEVEL.get(id);
      max = tonumber(max)! * boxConfig.DROP_RATE_BY_LEVEL.get(id);

      boxConfig.DROP_COUNT_BY_LEVEL.set(id, { min: min, max: max });
    }
  }

  /**
   * todo;
   *
   * @param object
   */
  public spawnDropBoxItems(object: GameObject): void {
    logger.info("Spawn items for:", object.name());

    const ini: IniFile = object.spawn_ini();
    const items: Optional<LuaTable<TSection, IBoxDropItemDescriptor>> = readBoxItemList(ini, "drop_box", "items");

    if (items) {
      for (const [, item] of items) {
        spawnItemsForObject(object, item.section, item.count);
      }
    } else {
      const section: TSection = readIniString(ini, "drop_box", "community", false, null, "def_box");
      const boxItemsToSpawn: LuaTable<TSection, TProbability> =
        boxConfig.ITEMS_BY_BOX_SECTION.get(section) ?? boxConfig.ITEMS_BY_BOX_SECTION.get("def_box");

      for (const [section, probability] of boxItemsToSpawn) {
        const it: IBoxDropProbabilityDescriptor = boxConfig.DROP_COUNT_BY_LEVEL.get(section);
        const count: TCount = math.ceil(math.random(it.min, it.max));

        spawnItemsForObject(object, section, count, probability);
      }
    }
  }
}
