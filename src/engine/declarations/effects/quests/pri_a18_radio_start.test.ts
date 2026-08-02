import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_a18_radio_start");
});

beforeEach(() => {
  resetRegistry();
});

describe("pri_a18_radio_start", () => {
  it("should start radio", () => {
    mockRegisteredActor();

    callXrEffect("pri_a18_radio_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a18_radio_start)).toBe(true);
  });
});
