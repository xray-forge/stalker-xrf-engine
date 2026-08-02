import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerZone } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/enemy_in_zone");
});

describe("enemy_in_zone", () => {
  it("should check enemy state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const zone: GameObject = MockGameObject.mock();

    registerZone(zone);

    expect(() => callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock())).toThrow(
      "Unexpected zone name 'nil' in enemy_in_zone xr condition."
    );

    jest.spyOn(zone, "inside").mockImplementation(() => true);

    expect(callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation(() => false);

    expect(callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(false);
  });
});
