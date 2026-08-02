import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { communities } from "@/engine/constants/communities";
import { registerSimulator } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/is_faction_friend_to_actor");
});

describe("is_faction_friend_to_actor", () => {
  it("should check actor and faction state", () => {
    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.actor
      )
    ).toBe(true);

    expect(
      callXrCondition("is_faction_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(true);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.bandit
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.stalker
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.monster
      )
    ).toBe(false);
  });
});
