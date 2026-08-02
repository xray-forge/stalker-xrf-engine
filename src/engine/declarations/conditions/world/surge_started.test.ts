import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/surge_started");
});

describe("surge_started", () => {
  it("should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();

    surgeConfig.IS_STARTED = true;
    expect(callXrCondition("surge_started", actorGameObject, MockGameObject.mock())).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(callXrCondition("surge_started", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});
