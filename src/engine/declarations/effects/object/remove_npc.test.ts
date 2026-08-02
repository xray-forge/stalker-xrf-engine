import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/remove_npc");
});

beforeEach(() => {
  resetRegistry();
});

describe("remove_npc", () => {
  it("should remove the server object linked by story id", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock(), "target");

    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
  });

  it("should do nothing without a story id or for an unknown one", () => {
    registerSimulator();

    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock(), "missing-npc");

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });
});
