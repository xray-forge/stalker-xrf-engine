import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/kill_squad");
});

beforeEach(() => {
  resetRegistry();
});

describe("kill_squad", () => {
  it("should kill both online and offline squad members", () => {
    const squad: MockSquad = MockSquad.mock();
    const onlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const offlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const onlineObject: GameObject = MockGameObject.mock({ id: onlineMember.id });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(offlineMember);
    squad.mockAddMember(onlineMember);
    squad.mockAddMember(offlineMember);
    registerObject(onlineObject);
    registerStoryLink(squad.id, "test-squad");
    jest.spyOn(offlineMember, "kill");

    callXrEffect("kill_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad");

    expect(onlineObject.kill).toHaveBeenCalledWith(onlineObject);
    expect(offlineMember.kill).toHaveBeenCalledTimes(1);
  });
});
