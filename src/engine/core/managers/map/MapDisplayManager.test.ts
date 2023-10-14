import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { ETreasureType, ITreasureDescriptor, treasureConfig } from "@/engine/core/managers/treasures";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { resetManagers } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

describe("MapDisplayManager class", () => {
  beforeEach(() => {
    resetManagers();
    treasureConfig.ENHANCED_MODE_ENABLED = true;
  });

  it.todo("should correctly initialize and destroy");

  it.todo("should correctly update object map spot");

  it.todo("should correctly remove object map spot");

  it.todo("should correctly update squad map spot");

  it.todo("should correctly remove squad map spot");

  it.todo("should correctly update smart terrain map spot");

  it.todo("should correctly remove smart terrain map spot");

  it.todo("should correctly update primary objects map spots");

  it.todo("should correctly remove primary objects map spots");

  it.todo("should correctly handle update event");

  it("should correctly get icon from treasure descriptor", () => {
    const mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();

    treasureConfig.ENHANCED_MODE_ENABLED = true;

    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.COMMON } as ITreasureDescriptor)).toBe(
      mapMarks.treasure
    );
    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.RARE } as ITreasureDescriptor)).toBe(
      mapMarks.treasure_rare
    );
    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.EPIC } as ITreasureDescriptor)).toBe(
      mapMarks.treasure_epic
    );
    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.UNIQUE } as ITreasureDescriptor)).toBe(
      mapMarks.treasure_unique
    );

    treasureConfig.ENHANCED_MODE_ENABLED = false;
    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.EPIC } as ITreasureDescriptor)).toBe(
      mapMarks.treasure
    );
    expect(mapDisplayManager.getSpotForTreasure({ type: ETreasureType.UNIQUE } as ITreasureDescriptor)).toBe(
      mapMarks.treasure
    );
  });

  it("should correctly display map objects for treasures", () => {
    resetFunctionMock(level.map_add_object_spot_ser);

    const mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();

    mapDisplayManager.showTreasureMapSpot(10, { type: ETreasureType.COMMON } as ITreasureDescriptor, "tst");
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(10, mapMarks.treasure, "tst");

    mapDisplayManager.showTreasureMapSpot(25, { type: ETreasureType.RARE } as ITreasureDescriptor);
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(25, mapMarks.treasure_rare, "");

    mapDisplayManager.showTreasureMapSpot(555, { type: ETreasureType.UNIQUE } as ITreasureDescriptor);
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(555, mapMarks.treasure_unique, "");
  });

  it("should correctly remove map objects for treasures", () => {
    resetFunctionMock(level.map_remove_object_spot);

    const mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();

    mapDisplayManager.removeTreasureMapSpot(10, { type: ETreasureType.COMMON } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(10, mapMarks.treasure);

    mapDisplayManager.removeTreasureMapSpot(25, { type: ETreasureType.RARE } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(25, mapMarks.treasure_rare);

    mapDisplayManager.removeTreasureMapSpot(555, { type: ETreasureType.UNIQUE } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(555, mapMarks.treasure_unique);
  });
});
