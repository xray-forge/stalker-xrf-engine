import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/spawn_object_in");
});

beforeEach(() => {
  resetRegistry();
});

describe("spawn_object_in", () => {
  it("should spawn objects in the server inventory of the story target", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("spawn_object_in", MockGameObject.mockActor(), MockGameObject.mock(), "test-item", "target");

    expect(registry.simulator.create).toHaveBeenCalledWith("test-item", expect.anything(), 0, 0, serverObject.id);
  });
});
