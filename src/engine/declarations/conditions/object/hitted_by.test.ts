import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/hitted_by");
});

describe("hitted_by", () => {
  it("should check object hit state", () => {
    const object: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const state: IRegistryObjectState = registerObject(object);

    registerObject(first);
    registerObject(second);

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "another-sid")).toBe(false);

    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.who = second.id();

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "another-sid")).toBe(false);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "second-sid", "another-sid")).toBe(true);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });
});
