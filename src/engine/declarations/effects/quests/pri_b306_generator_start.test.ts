import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_b306_generator_start");
});

beforeEach(() => {
  resetRegistry();
});

describe("pri_b306_generator_start", () => {
  it("should start generators", () => {
    mockRegisteredActor();

    callXrEffect("pri_b306_generator_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_b306_lift_generator_used)).toBe(false);

    const object: GameObject = MockGameObject.mock({ name: "pri_b306_sr_generator" });

    registerZone(object);

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("pri_b306_generator_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_b306_lift_generator_used)).toBe(true);
  });
});
