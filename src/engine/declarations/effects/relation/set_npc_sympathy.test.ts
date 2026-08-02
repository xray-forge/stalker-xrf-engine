import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { setObjectSympathy } from "@/engine/core/utils/relation";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_npc_sympathy");
});

jest.mock("@/engine/core/utils/relation");

beforeEach(() => {
  resetFunctionMock(setObjectSympathy);
});

describe("set_npc_sympathy", () => {
  it("should change relation", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_npc_sympathy", MockGameObject.mockActor(), object, 550);

    expect(setObjectSympathy).toHaveBeenCalledTimes(1);
    expect(setObjectSympathy).toHaveBeenCalledWith(object, 550);
  });
});
