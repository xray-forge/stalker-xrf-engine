import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, TRelationType } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/actor_neutral");
});

describe("actor_neutral", () => {
  it("should check if actor is neutral", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.NEUTRAL as TRelationType);
    expect(callXrCondition("actor_neutral", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_neutral", MockGameObject.mockActor(), object)).toBe(false);
  });
});
