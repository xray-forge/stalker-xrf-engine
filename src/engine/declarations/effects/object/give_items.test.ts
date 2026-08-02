import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/give_items");
});

describe("give_items", () => {
  it("should spawn every requested item in the linked object inventory", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    callXrEffect("give_items", MockGameObject.mockActor(), object, "item-a", "item-b");

    expect(registry.simulator.create).toHaveBeenCalledTimes(2);
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      1,
      "item-a",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      2,
      "item-b",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});
