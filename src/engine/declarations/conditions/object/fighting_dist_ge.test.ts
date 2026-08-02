import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/fighting_dist_ge");
});

describe("fighting_dist_ge", () => {
  it("should check distance", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(false);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);
  });
});
