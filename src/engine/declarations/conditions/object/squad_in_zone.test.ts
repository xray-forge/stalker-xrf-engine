import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator, registerStoryLink, registerZone } from "@/engine/core/database";
import { callXrCondition, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/squad_in_zone");
});

describe("squad_in_zone", () => {
  it("should check if squad is in zone", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(() => callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone)).toThrow(
      "Incorrect 'squad_in_zone' condition parameters: storyId 'nil', zoneName 'nil'."
    );
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "not-existing")).toBe(false);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === secondServer.position);

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(true);

    registerObject(first);
    registerObject(second);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === second.position());

    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);
  });
});
