import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { getJupB32ScannerPlacementZoneName } from "@/engine/constants/zone_names";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject } from "@/engine/core/utils/spawn";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b32_place_scanner");
});

jest.mock("@/engine/core/utils/reward");

jest.mock("@/engine/core/utils/spawn");

beforeEach(() => {
  resetRegistry();
});

describe("jup_b32_place_scanner", () => {
  it("should place scanners", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock({ name: getJupB32ScannerPlacementZoneName(5) });

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("jup_b32_place_scanner", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(false);
    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(false);

    registerZone(object);
    callXrEffect("jup_b32_place_scanner", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(true);
    expect(hasInfoPortion(infoPortions.jup_b32_tutorial_done)).toBe(true);
    expect(takeItemFromActor).toHaveBeenCalledWith(questItems.jup_b32_scanner_device);
    expect(spawnObject).toHaveBeenCalledWith("jup_b32_ph_scanner", "jup_b32_scanner_place_5");
  });
});
