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
  require("@/engine/declarations/conditions/object/squad_in_zone_all");
});

describe("squad_in_zone_all", () => {
  it("should check if squad members are in zone", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(() => callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone)).toThrow(
      "Incorrect params in 'squad_in_zone_all' condition: storyId 'nil', zoneName 'nil'"
    );
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "not-existing", "test")).toBe(false);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === firstServer.position);

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(false);

    registerObject(first);
    registerObject(second);

    jest.spyOn(zone, "inside").mockImplementation(() => true);

    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);
  });
});
