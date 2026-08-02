import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/surge_kill_all");
});

describe("surge_kill_all", () => {
  it("should check surge state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: SurgeManager = getManager(SurgeManager);

    jest.spyOn(manager, "isKillingAll").mockImplementation(() => false);
    expect(callXrCondition("surge_kill_all", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(manager, "isKillingAll").mockImplementation(() => true);
    expect(callXrCondition("surge_kill_all", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
