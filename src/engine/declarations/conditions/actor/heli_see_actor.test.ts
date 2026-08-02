import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/heli_see_actor");
});

describe("heli_see_actor", () => {
  it("should check if heli see actor", () => {
    const { actorGameObject } = mockRegisteredActor();
    const helicopter: GameObject = MockGameObject.mockHelicopter();

    jest.spyOn(helicopter.get_helicopter(), "isVisible").mockImplementation(() => true);

    expect(callXrCondition("heli_see_actor", actorGameObject, helicopter)).toBe(true);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledTimes(1);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledWith(actorGameObject);

    jest.spyOn(helicopter.get_helicopter(), "isVisible").mockImplementation(() => false);

    expect(callXrCondition("heli_see_actor", actorGameObject, helicopter)).toBe(false);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledTimes(2);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledWith(actorGameObject);
  });
});
