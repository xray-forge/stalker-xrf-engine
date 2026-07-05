import { level } from "xray16";
import { TLabel, TName, TNumberId } from "xray16/lib";

import { treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { mapMarks } from "@/engine/lib/constants/map_marks";

/**
 * Display map spot for treasure.
 *
 * @param id - Treasure restrictor ID to display on game map.
 * @param descriptor - Treasure descriptor.
 * @param hint - Label to display on secret hovering.
 */
export function showTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor, hint?: TLabel): void {
  level.map_add_object_spot_ser(id, getTreasureMapSpot(descriptor), hint ?? "");
}

/**
 * Remove treasure spot for treasure descriptor.
 *
 * @param id - Treasure restrictor ID to remove from game map.
 * @param descriptor - Treasure descriptor.
 */
export function removeTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor): void {
  level.map_remove_object_spot(id, getTreasureMapSpot(descriptor));
}

/**
 * @param descriptor - Descriptor of treasure object to get mark for.
 * @returns Icon name for provided descriptor, based on treasure type.
 */
export function getTreasureMapSpot(descriptor: ITreasureDescriptor): TName {
  if (!treasureConfig.ENHANCED_MODE_ENABLED) {
    return mapMarks.treasure;
  }

  switch (descriptor.type) {
    case ETreasureType.RARE:
      return mapMarks.treasure_rare;

    case ETreasureType.EPIC:
      return mapMarks.treasure_epic;

    case ETreasureType.UNIQUE:
      return mapMarks.treasure_unique;

    case ETreasureType.COMMON:
    default:
      return mapMarks.treasure;
  }
}
