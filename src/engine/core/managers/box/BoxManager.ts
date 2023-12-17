import { AbstractManager } from "@/engine/core/managers/base";
import { IBoxDropProbabilityDescriptor } from "@/engine/core/managers/box/box_types";
import { boxConfig } from "@/engine/core/managers/box/BoxConfig";
import { initializeDropBoxesLoot } from "@/engine/core/managers/box/utils";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { GameObject, TCount, TProbability, TSection } from "@/engine/lib/types";

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
    const section: TSection = readIniString(
      object.spawn_ini(),
      "drop_box",
      "community",
      false,
      null,
      boxConfig.LOT_BOX_DEFAULT
    );
    const items: LuaTable<TSection, TProbability> =
      boxConfig.DROP_ITEMS_BY_SECTION.get(section) ?? boxConfig.DROP_ITEMS_BY_SECTION.get(boxConfig.LOT_BOX_DEFAULT);

    logger.format("Spawn items for: %s %s", object.name(), section);

    for (const [section, probability] of items) {
      const descriptor: IBoxDropProbabilityDescriptor = boxConfig.DROP_COUNT_BY_LEVEL.get(section);
      const count: TCount = math.ceil(math.random(descriptor.min, descriptor.max));

      spawnItemsForObject(object, section, count, probability);
    }
  }
}
