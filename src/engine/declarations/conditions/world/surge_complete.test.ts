import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/surge_complete");
});

describe("surge_complete", () => {
  it("should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();

    surgeConfig.IS_FINISHED = false;
    expect(callXrCondition("surge_complete", actorGameObject, MockGameObject.mock())).toBe(false);

    surgeConfig.IS_FINISHED = true;
    expect(callXrCondition("surge_complete", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
