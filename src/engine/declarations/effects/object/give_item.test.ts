import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/give_item");
});

beforeEach(() => {
  resetRegistry();
});

describe("give_item", () => {
  it("should give an item to the linked server object", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject = MockAlifeObject.create({ id: object.id() });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);

    callXrEffect("give_item", MockGameObject.mockActor(), object, "test-item");

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test-item",
      serverObject.position,
      serverObject.m_level_vertex_id,
      serverObject.m_game_vertex_id,
      serverObject.id
    );
  });
});
