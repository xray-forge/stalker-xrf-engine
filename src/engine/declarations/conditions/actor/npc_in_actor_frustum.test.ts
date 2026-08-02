import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isObjectInActorFrustum } from "@/engine/core/utils/position";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/position");
beforeEach(() => {
  resetFunctionMock(isObjectInActorFrustum);
});
beforeAll(() => {
  require("@/engine/declarations/conditions/actor/npc_in_actor_frustum");
});

describe("npc_in_actor_frustum", () => {
  it("should check whether object is in actor frustum", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isObjectInActorFrustum, () => true);

    expect(callXrCondition("npc_in_actor_frustum", MockGameObject.mockActor(), object)).toBe(true);
    expect(isObjectInActorFrustum).toHaveBeenCalledTimes(1);
    expect(isObjectInActorFrustum).toHaveBeenCalledWith(object);

    replaceFunctionMock(isObjectInActorFrustum, () => false);

    expect(callXrCondition("npc_in_actor_frustum", MockGameObject.mockActor(), object)).toBe(false);
    expect(isObjectInActorFrustum).toHaveBeenCalledTimes(2);
    expect(isObjectInActorFrustum).toHaveBeenCalledWith(object);
  });
});
