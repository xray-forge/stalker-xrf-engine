import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/spawn_item_to_npc");
});

beforeEach(() => {
  resetRegistry();
});

describe("spawn_item_to_npc", () => {
  it("should spawn an item in the object inventory", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    callXrEffect("spawn_item_to_npc", MockGameObject.mockActor(), object, "test-item");
    callXrEffect("spawn_item_to_npc", MockGameObject.mockActor(), object);

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test-item",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});
