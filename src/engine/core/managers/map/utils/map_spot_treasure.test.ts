import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import {
  getTreasureMapSpot,
  removeTreasureMapSpot,
  showTreasureMapSpot,
} from "@/engine/core/managers/map/utils/map_spot_treasure";
import { ETreasureType, ITreasureDescriptor, treasureConfig } from "@/engine/core/managers/treasures";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

describe("getTreasureMapSpot util", () => {
  it("should correctly get icon from treasure descriptor", () => {
    treasureConfig.ENHANCED_MODE_ENABLED = true;

    expect(getTreasureMapSpot({ type: ETreasureType.COMMON } as ITreasureDescriptor)).toBe(mapMarks.treasure);
    expect(getTreasureMapSpot({ type: ETreasureType.RARE } as ITreasureDescriptor)).toBe(mapMarks.treasure_rare);
    expect(getTreasureMapSpot({ type: ETreasureType.EPIC } as ITreasureDescriptor)).toBe(mapMarks.treasure_epic);
    expect(getTreasureMapSpot({ type: ETreasureType.UNIQUE } as ITreasureDescriptor)).toBe(mapMarks.treasure_unique);

    treasureConfig.ENHANCED_MODE_ENABLED = false;

    expect(getTreasureMapSpot({ type: ETreasureType.EPIC } as ITreasureDescriptor)).toBe(mapMarks.treasure);
    expect(getTreasureMapSpot({ type: ETreasureType.UNIQUE } as ITreasureDescriptor)).toBe(mapMarks.treasure);
  });
});

describe("showTreasureMapSpot util", () => {
  beforeEach(() => {
    resetRegistry();
    treasureConfig.ENHANCED_MODE_ENABLED = true;
  });

  it("should correctly display map objects for treasures", () => {
    resetFunctionMock(level.map_add_object_spot_ser);

    showTreasureMapSpot(10, { type: ETreasureType.COMMON } as ITreasureDescriptor, "tst");
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(10, mapMarks.treasure, "tst");

    showTreasureMapSpot(25, { type: ETreasureType.RARE } as ITreasureDescriptor);
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(25, mapMarks.treasure_rare, "");

    showTreasureMapSpot(555, { type: ETreasureType.UNIQUE } as ITreasureDescriptor);
    expect(level.map_add_object_spot_ser).toHaveBeenCalledWith(555, mapMarks.treasure_unique, "");
  });
});

describe("removeTreasureMapSpot util", () => {
  beforeEach(() => {
    resetRegistry();
    treasureConfig.ENHANCED_MODE_ENABLED = true;
  });

  it("should correctly remove map objects for treasures", () => {
    resetFunctionMock(level.map_remove_object_spot);

    removeTreasureMapSpot(10, { type: ETreasureType.COMMON } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(10, mapMarks.treasure);

    removeTreasureMapSpot(25, { type: ETreasureType.RARE } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(25, mapMarks.treasure_rare);

    removeTreasureMapSpot(555, { type: ETreasureType.UNIQUE } as ITreasureDescriptor);
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(555, mapMarks.treasure_unique);
  });
});
