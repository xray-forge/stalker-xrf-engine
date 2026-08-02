import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/hitted_on_bone");
});

describe("hitted_on_bone", () => {
  it("should check object hit bone", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    jest.spyOn(object, "get_bone_id").mockImplementation((name) => (name === "bone-b" ? 2 : -1));

    schemeState.boneIndex = 2;

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a")).toBe(false);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-b")).toBe(true);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(true);
  });
});
