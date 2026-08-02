import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b47_npc_online");
});

describe("jup_b47_npc_online", () => {
  it("should check npc online state", () => {
    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      false
    );

    const object: GameObject = MockGameObject.mock();

    registerSimulator();
    registerObject(object);
    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      false
    );

    MockAlifeHumanStalker.mock({ id: object.id() });

    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      true
    );
  });
});
