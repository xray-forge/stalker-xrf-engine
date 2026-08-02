import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/remove_squad");
});

beforeEach(() => {
  resetRegistry();
});

describe("remove_squad", () => {
  it("should release every squad member from simulation", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    squad.mockAddMember(first);
    squad.mockAddMember(second);
    registerStoryLink(squad.id, "test-squad");

    callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad");

    expect(registry.simulator.release).toHaveBeenNthCalledWith(1, first, true);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(2, second, true);
    expect(squad.npc_count()).toBe(0);
  });

  it("should reject a missing squad and an unknown story id", () => {
    registerSimulator();

    expect(() => callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock())).toThrow();
    expect(() =>
      callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock(), "missing-squad")
    ).toThrow();
  });
});
