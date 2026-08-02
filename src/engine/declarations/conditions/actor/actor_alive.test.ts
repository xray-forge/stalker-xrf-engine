import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_alive");
});

describe("actor_alive", () => {
  it("should check if actor is alive", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_alive", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "alive").mockImplementation(() => false);

    expect(callXrCondition("actor_alive", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});
