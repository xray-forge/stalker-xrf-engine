import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b15_zulus_drink_anim_info");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b15_zulus_drink_anim_info", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_b15_zulus_drink_anim_info", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_b15_zulus_drink_anim_info)).toBe(true);
  });
});
