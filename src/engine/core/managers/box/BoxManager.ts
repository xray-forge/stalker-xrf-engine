import { GameObject, IniFile, Vector } from "xray16/alias";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { IBoxDropProbabilityDescriptor } from "@/engine/core/managers/box/box_types";
import {
  BOX_DEFAULT,
  BOX_METAL_01,
  BOX_SMALL_GENERIC,
  BOX_WOOD_01,
  BOX_WOOD_02,
  boxConfig,
} from "@/engine/core/managers/box/BoxConfig";
import { initializeDropBoxesLootTables } from "@/engine/core/managers/box/utils";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { chance } from "@/engine/core/utils/random";
import { spawnItemsAtPosition } from "@/engine/core/utils/spawn";
import { copyVector } from "@/engine/core/utils/vector";
import { AnyObject, Nillable, TCount, TDirection, TProbability, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling boxes that may provide loot on destruction.
 */
export class BoxManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);

    initializeDropBoxesLootTables();
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
  }

  /**
   * Spawn box items on destruction (or another event) to drop.
   *
   * @param object - Game object to spawn box items for.
   */
  public spawnBoxObjectItems(object: GameObject): void {
    const spawnIni: Nillable<IniFile> = object.spawn_ini() as Nillable<IniFile>;
    const section: Nillable<TSection> = spawnIni
      ? readIniString(spawnIni, "drop_box", "community", false, null, BOX_DEFAULT)
      : null;

    if (section) {
      logger.info("Spawn items for: %s %s", object.name(), section);

      this.spawnBoxObjectItemsFromList(
        object,
        boxConfig.DROP_ITEMS_BY_SECTION.get(section) ?? boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_DEFAULT)
      );
    } else if (chance(boxConfig.GENERIC_LOOT_BOX_DROP_CHANCE)) {
      logger.info("Spawn items for generic box: %s", object.name());

      switch (object.get_visual_name()) {
        case BOX_METAL_01:
          return this.spawnBoxObjectItemsFromList(object, boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC));

        case BOX_WOOD_01:
          return this.spawnBoxObjectItemsFromList(object, boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC));

        case BOX_WOOD_02:
          return this.spawnBoxObjectItemsFromList(object, boxConfig.DROP_ITEMS_BY_SECTION.get(BOX_SMALL_GENERIC));
      }
    }
  }

  /**
   * Spawn box loot items for provided game object.
   * Based on list of items provided as parameter.
   *
   * Specifics of this spawning is to place all items on top and minimize clipping (fuzz Y coordinate).
   * Also place item as not linked to any object.
   *
   * @param object - Target object to spawn for.
   * @param items - List of item section to check and try to spawn.
   */
  public spawnBoxObjectItemsFromList(object: GameObject, items: LuaTable<TSection, TProbability>): void {
    const [, gvid, lvid, position] = getObjectPositioning(object);

    const destination: Vector = copyVector(position);
    const baseline: TDirection = destination.y;

    for (const [section, probability] of items) {
      const descriptor: IBoxDropProbabilityDescriptor = boxConfig.DROP_COUNT_BY_LEVEL.get(section);
      const count: TCount = math.ceil(math.random(descriptor.min, descriptor.max));

      // Varying height for less clipping and unexpected physical impacts.
      destination.y = baseline + 0.2 + 0.3 * math.random();

      spawnItemsAtPosition(section, gvid, lvid, destination, count, probability);
    }
  }

  /**
   * Handle dump data event.
   *
   * @param data - Data to dump into file.
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      boxConfig: boxConfig,
    };

    return data;
  }
}
