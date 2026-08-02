import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { storyIds } from "@/engine/constants/story_ids";
import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, MockSquad } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/pri_a28_actor_is_far");
});

describe("pri_a28_actor_is_far", () => {
  it("should check actor state", () => {
    expect(() => callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Unexpected actor distance check - no squad existing."
    );

    const squad: MockSquad = MockSquad.createRegistered();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerSimulator();
    registerStoryLink(squad.id, storyIds.pri_a16_military_squad);

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 150 * 150 - 1);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 150 * 150 - 1);

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 150 * 150 + 1);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 150 * 150 + 1);

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
  });
});
