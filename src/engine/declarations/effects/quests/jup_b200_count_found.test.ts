import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b200_count_found");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b200_count_found", () => {
  it("should count carried materials together with the saved counter", () => {
    const { actorGameObject } = mockRegisteredActor();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "jup_b200_material_1");
    registerStoryLink(second.id(), "jup_b200_material_2");
    jest.spyOn(first, "parent").mockReturnValue(actorGameObject);
    jest.spyOn(second, "parent").mockReturnValue(actorGameObject);
    setPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 3);

    callXrEffect("jup_b200_count_found", actorGameObject, MockGameObject.mock());

    expect(getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_found_counter")).toBe(5);
  });
});
