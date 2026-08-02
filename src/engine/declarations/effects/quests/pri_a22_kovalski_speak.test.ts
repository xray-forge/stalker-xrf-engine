import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_a22_kovalski_speak");
});

beforeEach(() => {
  resetRegistry();
});

describe("pri_a22_kovalski_speak", () => {
  it("should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a22_kovalski_speak", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a22_kovalski_speak)).toBe(true);
  });
});
