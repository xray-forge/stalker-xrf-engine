import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { weapons } from "@/engine/constants/items/weapons";
import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/relocate_item");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("relocate_item", () => {
  it("should correctly relocate items from one object to another", () => {
    registerSimulator();

    const item: GameObject = MockGameObject.mock({ section: weapons.wpn_svu });
    const from: GameObject = MockGameObject.mock({ inventory: [[item.section(), item]] });
    const to: GameObject = MockGameObject.mock();

    registerStoryLink(from.id(), "from-sid");
    registerStoryLink(to.id(), "to-sid");

    expect(() => callXrEffect("relocate_item", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Couldn't relocate item to not existing object 'nil' in 'relocate_item' effect."
    );

    callXrEffect("relocate_item", MockGameObject.mockActor(), MockGameObject.mock(), "unknown", "from-sid", "to-sid");

    expect(from.transfer_item).toHaveBeenCalledTimes(0);
    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "unknown",
      to.position(),
      to.level_vertex_id(),
      to.game_vertex_id(),
      to.id()
    );

    callXrEffect(
      "relocate_item",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      weapons.wpn_svu,
      "from-sid",
      "to-sid"
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(from.transfer_item).toHaveBeenCalledTimes(1);
    expect(from.transfer_item).toHaveBeenCalledWith(item, to);
  });
});
