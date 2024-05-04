import { level } from "xray16";

import { treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { TLabel, TName, TNumberId } from "@/engine/lib/types";

/**
 * Display map spot for treasure.
 *
 * @param id - treasure restrictor ID to display on game map
 * @param descriptor - treasure descriptor
 * @param hint - label to display on secret hovering
 */
export function showTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor, hint?: TLabel): void {
  level.map_add_object_spot_ser(id, getTreasureMapSpot(descriptor), hint ?? "");
}

/**
 * Remove treasure spot for treasure descriptor.
 *
 * @param id - treasure restrictor ID to remove from game map
 * @param descriptor - treasure descriptor
 */
export function removeTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor): void {
  level.map_remove_object_spot(id, getTreasureMapSpot(descriptor));
}

/**
 * @param descriptor - descriptor of treasure object to get mark for
 * @returns icon name for provided descriptor, based on treasure type
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
