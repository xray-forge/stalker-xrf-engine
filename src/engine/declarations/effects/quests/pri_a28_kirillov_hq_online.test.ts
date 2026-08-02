import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_a28_kirillov_hq_online");
});

beforeEach(() => {
  resetRegistry();
});

describe("pri_a28_kirillov_hq_online", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a28_kirillov_hq_online", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a28_kirillov_hq_online)).toBe(true);
  });
});
