import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/dist_to_actor_ge");
});

describe("dist_to_actor_ge", () => {
  it("should check distance between actor and object", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrCondition("dist_to_actor_ge", actorGameObject, object, null)).toThrow(
      "Wrong parameter in 'dist_to_actor_ge' function: 'nil'."
    );

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);

    expect(callXrCondition("dist_to_actor_ge", actorGameObject, object, 10)).toBe(true);
    expect(object.position().distance_to_sqr).toHaveBeenCalledTimes(1);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(actorGameObject.position());

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);

    expect(callXrCondition("dist_to_actor_ge", actorGameObject, object, 10)).toBe(false);
    expect(object.position().distance_to_sqr).toHaveBeenCalledTimes(2);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);

    expect(callXrCondition("dist_to_actor_ge", actorGameObject, object, 10)).toBe(true);
    expect(object.position().distance_to_sqr).toHaveBeenCalledTimes(3);
  });
});
