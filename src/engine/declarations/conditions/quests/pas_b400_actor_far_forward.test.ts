import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { storyIds } from "@/engine/constants/story_ids";
import { registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor, MockSquad } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/pas_b400_actor_far_forward");
});

describe("pas_b400_actor_far_forward", () => {
  it("should require the actor and every squad member to be far from the escort", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const objectServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const memberObject: GameObject = MockGameObject.mock({ id: member.id });
    const squad: MockSquad = MockSquad.mock();
    const forward: GameObject = MockGameObject.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(objectServer);
    MockAlifeSimulator.addToRegistry(member);
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(objectServer);
    squad.mockAddMember(member);
    registerObject(object);
    registerObject(memberObject);
    registerStoryLink(forward.id(), storyIds.pas_b400_fwd);
    registerObject(forward);
    jest.spyOn(forward.position(), "distance_to_sqr").mockReturnValue(1);
    jest.spyOn(object.position(), "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(objectServer.position, "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(member.position, "distance_to_sqr").mockReturnValue(70 * 70);

    expect(callXrCondition("pas_b400_actor_far_forward", actorGameObject, object)).toBe(true);

    jest.spyOn(object.position(), "distance_to_sqr").mockReturnValue(70 * 70 - 1);
    expect(callXrCondition("pas_b400_actor_far_forward", actorGameObject, object)).toBe(false);
  });
});
