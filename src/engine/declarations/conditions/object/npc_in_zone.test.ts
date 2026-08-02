import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerObject, registerZone } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/npc_in_zone");
});

describe("npc_in_zone", () => {
  it("should check object zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });

    jest.spyOn(zone, "name").mockImplementation(() => "zone-name");
    jest.spyOn(zone, "inside").mockImplementation((position) => position === object.position());

    registerObject(object);
    registerZone(zone);

    expect(callXrCondition("npc_in_zone", MockGameObject.mockActor(), object, "zone-name")).toBe(true);
    expect(callXrCondition("npc_in_zone", MockGameObject.mockActor(), object, "zone-name-random")).toBe(false);

    expect(
      callXrCondition("npc_in_zone", MockGameObject.mockActor(), serverObject as unknown as GameObject, "zone-name")
    ).toBe(true);
    expect(
      callXrCondition(
        "npc_in_zone",
        MockGameObject.mockActor(),
        serverObject as unknown as GameObject,
        "zone-name-random"
      )
    ).toBe(true);

    const serverOnlyObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    jest.spyOn(zone, "inside").mockImplementation((position) => position === serverOnlyObject.position);

    expect(
      callXrCondition("npc_in_zone", MockGameObject.mockActor(), serverOnlyObject as unknown as GameObject, "zone-name")
    ).toBe(true);
  });
});
