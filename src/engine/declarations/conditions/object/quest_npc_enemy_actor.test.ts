import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/quest_npc_enemy_actor");
});

describe("quest_npc_enemy_actor", () => {
  it("should recognize a hostile story stalker", () => {
    const { actorGameObject } = mockRegisteredActor();
    const stalker: GameObject = MockGameObject.mockStalker();

    registerStoryLink(stalker.id(), "test-story-stalker");
    jest.spyOn(stalker, "general_goodwill").mockReturnValue(-1000);

    expect(callXrCondition("quest_npc_enemy_actor", actorGameObject, MockGameObject.mock(), "test-story-stalker")).toBe(
      true
    );

    jest.spyOn(stalker, "general_goodwill").mockReturnValue(-999);
    expect(callXrCondition("quest_npc_enemy_actor", actorGameObject, MockGameObject.mock(), "test-story-stalker")).toBe(
      false
    );
  });
});
