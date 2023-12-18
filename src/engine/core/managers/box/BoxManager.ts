import { AbstractManager } from "@/engine/core/managers/base";
import {
  BOX_METAL_01,
  BOX_WOOD_01,
  BOX_WOOD_02,
  boxConfig,
  LOT_BOX_DEFAULT,
  LOT_BOX_SMALL_GENERIC,
} from "@/engine/core/managers/box/BoxConfig";
import { initializeDropBoxesLoot, spawnLootForSections } from "@/engine/core/managers/box/utils";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { chance } from "@/engine/core/utils/random";
import { GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling boxes that may provide loot on destruction.
 */
export class BoxManager extends AbstractManager {
  public override initialize(): void {
    initializeDropBoxesLoot();
  }

  /**
   * Spawn box items on destruction (or another event) to drop.
   *
   * @param object - target game object to spawn box items for
   */
  public spawnDropBoxItems(object: GameObject): void {
    const spawnIni: Optional<IniFile> = object.spawn_ini() as Optional<IniFile>;
    const section: Optional<TSection> = spawnIni
      ? readIniString(spawnIni, "drop_box", "community", false, null, LOT_BOX_DEFAULT)
      : null;

    if (section) {
      logger.format("Spawn items for: %s %s", object.name(), section);

      spawnLootForSections(
        object,
        boxConfig.DROP_ITEMS_BY_SECTION.get(section) ?? boxConfig.DROP_ITEMS_BY_SECTION.get(LOT_BOX_DEFAULT)
      );
    } else {
      if (!chance(boxConfig.GENERIC_LOOT_BOX_DROP_CHANCE)) {
        return;
      }

      logger.format("Spawn items for generic box: %s", object.name());

      switch (object.get_visual_name()) {
        case BOX_METAL_01:
          return spawnLootForSections(object, boxConfig.DROP_ITEMS_BY_SECTION.get(LOT_BOX_SMALL_GENERIC));

        case BOX_WOOD_01:
          return spawnLootForSections(object, boxConfig.DROP_ITEMS_BY_SECTION.get(LOT_BOX_SMALL_GENERIC));

        case BOX_WOOD_02:
          return spawnLootForSections(object, boxConfig.DROP_ITEMS_BY_SECTION.get(LOT_BOX_SMALL_GENERIC));
      }
    }
  }
}
