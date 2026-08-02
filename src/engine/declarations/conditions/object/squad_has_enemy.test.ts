import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registerZone } from "@/engine/core/database";
import { callXrCondition, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/squad_has_enemy");
});

describe("squad_has_enemy", () => {
  it("should check if squad has enemy", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "not-existing")).toBe(false);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    jest.spyOn(second, "best_enemy").mockImplementation(() => MockGameObject.mock());

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(true);
  });
});
