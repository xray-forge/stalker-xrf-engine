import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b3_tech_waked_up");
});

beforeEach(() => {
  resetRegistry();
});

describe("zat_b3_tech_waked_up", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b3_tech_waked_up", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b3_tech_waked_up)).toBe(true);
  });
});
