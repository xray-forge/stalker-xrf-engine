import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/squad_npc_count_ge");
});

describe("squad_npc_count_ge", () => {
  it("squad_npc_count_ge should compare the resolved squad member count with the threshold", () => {
    const squad: MockSquad = MockSquad.mock();

    squad.mockAddMember(MockAlifeHumanStalker.mock());
    squad.mockAddMember(MockAlifeHumanStalker.mock());
    registerStoryLink(squad.id, "test-squad");

    expect(
      callXrCondition("squad_npc_count_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", "1")
    ).toBe(true);
    expect(
      callXrCondition("squad_npc_count_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", "2")
    ).toBe(false);
  });
});
