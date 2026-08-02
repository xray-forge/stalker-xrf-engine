import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, TRelationType } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/actor_friend");
});

describe("actor_friend", () => {
  it("should check if actor is friendly", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callXrCondition("actor_friend", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_friend", MockGameObject.mockActor(), object)).toBe(false);
  });
});
