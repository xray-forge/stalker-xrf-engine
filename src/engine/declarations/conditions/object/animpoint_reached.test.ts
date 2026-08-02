import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { AnimpointController } from "@/engine/core/schemes/stalker/animpoint/AnimpointController";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/animpoint_reached");
});

describe("animpoint_reached", () => {
  it("should check if animpoint is reached", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);

    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.ANIMPOINT, schemeState);
    schemeState.animpointController = new AnimpointController(object, schemeState);

    jest.spyOn(schemeState.animpointController, "isPositionReached").mockImplementation(() => true);
    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(schemeState.animpointController, "isPositionReached").mockImplementation(() => false);
    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(false);
  });
});
