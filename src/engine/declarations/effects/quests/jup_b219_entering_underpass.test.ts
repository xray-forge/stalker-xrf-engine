import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b219_entering_underpass");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b219_entering_underpass", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_b219_entering_underpass", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_b219_entering_underpass)).toBe(true);
  });
});
