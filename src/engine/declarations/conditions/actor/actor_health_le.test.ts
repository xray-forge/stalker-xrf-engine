import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_health_le");
});

describe("actor_health_le", () => {
  it("should check actor health", () => {
    const { actorGameObject } = mockRegisteredActor({ health: 0.5 });

    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), null)).toBe(false);
    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), 1)).toBe(true);
    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), 0.55)).toBe(true);
    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), 0.5)).toBe(false);
    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), 0.4)).toBe(false);
    expect(callXrCondition("actor_health_le", actorGameObject, MockGameObject.mock(), 0)).toBe(false);
  });
});
