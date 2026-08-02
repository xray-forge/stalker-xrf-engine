import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/killed_by_actor");
});

describe("killed_by_actor", () => {
  it("should check if object is killed by actor", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.DEATH, mockSchemeState(EScheme.DEATH));

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    getSchemeStateOptimistic(state, EScheme.DEATH).killerId = 1;

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    getSchemeStateOptimistic(state, EScheme.DEATH).killerId = 0;

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(true);
  });
});
