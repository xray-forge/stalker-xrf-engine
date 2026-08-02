import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockAlifeHumanStalker, mockCharactersGoodwill, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/is_squad_friend_to_actor");
});

describe("is_squad_friend_to_actor", () => {
  it("should check relations", () => {
    expect(callXrCondition("is_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(
      callXrCondition("is_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")
    ).toBe(false);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    const firstSquad: MockSquad = MockSquad.mock();
    const secondSquad: MockSquad = MockSquad.mock();

    registerStoryLink(firstSquad.id, "test-sid-1");
    registerStoryLink(secondSquad.id, "test-sid-2");

    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    secondSquad.mockAddMember(firstStalker);
    secondSquad.mockAddMember(secondStalker);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, -1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, 999);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, -500);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(true);
  });
});
