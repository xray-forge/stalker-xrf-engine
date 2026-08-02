import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_a1_tutorial_end_give");
});

beforeEach(() => {
  resetRegistry();
});

describe("zat_a1_tutorial_end_give", () => {
  it("should give info portions", () => {
    mockRegisteredActor();

    callXrEffect("zat_a1_tutorial_end_give", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_a1_tutorial_end)).toBe(true);
  });
});
