import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registry } from "@/engine/core/database";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/position/teleport_actor");
});

beforeEach(() => {
  resetRegistry();
});

describe("teleport_actor", () => {
  it("should teleport actors", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("teleport_actor", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_actor' effect."
    );

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp");

    expect(actorGameObject.set_actor_direction).toHaveBeenCalledTimes(0);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp-2", "test-wp-3");

    expect(actorGameObject.set_actor_direction).toHaveBeenCalledWith(expect.closeTo(-1.5707));
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp-2").point(0));

    expect(registry.noWeaponZones.length()).toBe(0);

    const noWeaponZone: GameObject = MockGameObject.mock();

    registerObject(noWeaponZone);

    jest.spyOn(noWeaponZone, "inside").mockImplementation(() => true);

    registry.noWeaponZones.set(noWeaponZone.id(), false);

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp");

    expect(registry.noWeaponZones.get(noWeaponZone.id())).toBe(true);
  });
});
