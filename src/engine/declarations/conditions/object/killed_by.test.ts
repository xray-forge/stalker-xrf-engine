import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/killed_by");
});

describe("killed_by", () => {
  it("should check object killed by", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeDeathState = mockSchemeState(EScheme.DEATH);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object)).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    setSchemeState(state, EScheme.DEATH, schemeState);

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.killerId = second.id();

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid")).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "second-sid")).toBe(true);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });
});
