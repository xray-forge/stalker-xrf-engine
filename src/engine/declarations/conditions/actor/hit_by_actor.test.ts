import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/hit_by_actor");
});

describe("hit_by_actor", () => {
  it("should check if object is hit by actor", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.HIT, mockSchemeState(EScheme.HIT));

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    getSchemeStateOptimistic(state, EScheme.HIT).who = 1;

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    getSchemeStateOptimistic(state, EScheme.HIT).who = 0;

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(true);
  });
});
