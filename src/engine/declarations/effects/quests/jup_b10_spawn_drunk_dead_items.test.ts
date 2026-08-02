import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject, MockVector } from "xray16/mocks";

import { questItems } from "@/engine/constants/items/quest_items";
import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b10_spawn_drunk_dead_items");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b10_spawn_drunk_dead_items", () => {
  it("should spawn the complete loot set or the counter-selected box item", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const box = MockAlifeObject.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(box);

    callXrEffect("jup_b10_spawn_drunk_dead_items", actorGameObject, object);

    expect(registry.simulator.create).toHaveBeenCalledTimes(44);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      questItems.jup_b10_ufo_memory_2,
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );

    registerStoryLink(box.id, "ufo-box");
    setPortableStoreValue(ACTOR_ID, "jup_b10_ufo_counter", 2);
    callXrEffect("jup_b10_spawn_drunk_dead_items", actorGameObject, object, "ufo-box");

    expect(registry.simulator.create).toHaveBeenLastCalledWith("wpn_sig550_luckygun", MockVector.mock(), 0, 0, box.id);
  });
});
