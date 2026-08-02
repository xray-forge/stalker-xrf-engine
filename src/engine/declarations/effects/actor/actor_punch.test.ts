import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { objectPunchActor } from "@/engine/core/utils/action";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/actor_punch");
});

jest.mock("@/engine/core/utils/action");

beforeEach(() => {
  resetFunctionMock(objectPunchActor);
});

describe("actor_punch", () => {
  it("should punch actor by object", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_punch", MockGameObject.mockActor(), object);

    expect(objectPunchActor).toHaveBeenCalledWith(object);
  });
});
