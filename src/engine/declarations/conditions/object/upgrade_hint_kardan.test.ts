import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/upgrade_hint_kardan");
});

describe("upgrade_hint_kardan", () => {
  it("should publish missing requirements and allow upgrades after both requirements are met", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);
    const setCurrentHints = jest.spyOn(manager, "setCurrentHints");

    mockRegisteredActor();

    expect(callXrCondition("upgrade_hint_kardan", MockGameObject.mockActor(), MockGameObject.mock(), "0")).toBe(false);
    expect(setCurrentHints).toHaveBeenLastCalledWith(
      $fromArray(["st_upgr_toolkit_1", "st_upgr_toolkit_2", "st_upgr_toolkit_3", "st_upgr_vodka"])
    );

    giveInfoPortion("zat_b3_all_instruments_brought");
    giveInfoPortion("zat_b3_tech_see_produce_62");

    expect(callXrCondition("upgrade_hint_kardan", MockGameObject.mockActor(), MockGameObject.mock(), "0")).toBe(true);
    expect(setCurrentHints).toHaveBeenLastCalledWith($fromArray([]));
  });
});
