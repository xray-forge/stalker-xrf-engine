import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { isObjectInZone } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerZone } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

jest.mock("xray16/lib", () => ({
  ...jest.requireActual<typeof import("xray16/lib")>("xray16/lib"),
  isObjectInZone: jest.fn(),
}));
beforeEach(() => {
  resetFunctionMock(isObjectInZone);
});
beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_in_zone");
});

describe("actor_in_zone", () => {
  it("should check actor in zone", () => {
    const { actorGameObject } = mockRegisteredActor();
    const zone: GameObject = MockGameObject.mock();

    registerZone(zone);
    replaceFunctionMock(isObjectInZone, () => false);

    expect(callXrCondition("actor_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(false);
    expect(isObjectInZone).toHaveBeenCalledTimes(1);
    expect(isObjectInZone).toHaveBeenCalledWith(actorGameObject, zone);

    replaceFunctionMock(isObjectInZone, () => true);

    expect(callXrCondition("actor_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(true);
    expect(isObjectInZone).toHaveBeenCalledTimes(2);
    expect(isObjectInZone).toHaveBeenCalledWith(actorGameObject, zone);
  });
});
