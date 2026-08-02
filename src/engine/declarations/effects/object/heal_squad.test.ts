import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/heal_squad");
});

beforeEach(() => {
  resetRegistry();
});

describe("heal_squad", () => {
  it("should restore health for every online squad member", () => {
    const squad: MockSquad = MockSquad.mock();
    const onlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const offlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const onlineObject: GameObject = MockGameObject.mock({ id: onlineMember.id, health: 0.2 });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(onlineMember);
    squad.mockAddMember(offlineMember);
    registerObject(onlineObject);
    registerStoryLink(squad.id, "test-squad");

    callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", 100);

    expect(onlineObject.health).toBe(1);
  });

  it("should reject a missing squad identifier and ignore an unknown squad", () => {
    expect(() => callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong squad identifier 'nil' in heal_squad effect"
    );

    expect(() =>
      callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock(), "missing-squad")
    ).not.toThrow();
  });
});
