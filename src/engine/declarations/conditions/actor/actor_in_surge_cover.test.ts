import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/managers/surge/utils/surge_cover");
beforeEach(() => {
  resetFunctionMock(isActorInSurgeCover);
});
beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_in_surge_cover");
});

describe("actor_in_surge_cover", () => {
  it("should check if actor is in surge cover", () => {
    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callXrCondition("actor_in_surge_cover", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callXrCondition("actor_in_surge_cover", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
  });
});
