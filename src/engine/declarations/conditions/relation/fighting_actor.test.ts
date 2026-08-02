import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/fighting_actor");
});

describe("fighting_actor", () => {
  it("should check combat state of object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.enemyId = ACTOR_ID;
    expect(callXrCondition("fighting_actor", MockGameObject.mockActor(), object)).toBe(true);

    state.enemyId = null;
    expect(callXrCondition("fighting_actor", MockGameObject.mockActor(), object)).toBe(false);
  });
});
