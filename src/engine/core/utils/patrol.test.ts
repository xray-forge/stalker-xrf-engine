import { describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { registerZone } from "@/engine/core/database";
import { isObjectAtTerminalWaypoint, isObjectAtWaypoint, isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { GameObject, Patrol, Vector } from "@/engine/lib/types";
import { MockGameObject, patrols } from "@/fixtures/xray";

describe("patrol utils", () => {
  it("isObjectAtWaypoint should correctly check whether object is at waypoint", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.131);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 1)).toBe(false);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[1].position);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.13);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 2)).toBe(true);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[2].position);
  });

  it("isObjectAtTerminalWaypoint should correctly check whether object is at terminal waypoint", () => {
    const object: GameObject = MockGameObject.mock();
    const waypointPatrol: Patrol = new patrol("test-wp");
    const lastPoint: Vector = waypointPatrol.point(2);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation((it) => (it === lastPoint ? 0.131 : 0));
    expect(isObjectAtTerminalWaypoint(object, waypointPatrol)[0]).toBe(false);
    expect(isObjectAtTerminalWaypoint(object, waypointPatrol)[1]).toBeNull();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation((it) => (it === lastPoint ? 0.13 : Infinity));
    expect(isObjectAtTerminalWaypoint(object, waypointPatrol)[0]).toBe(true);
    expect(isObjectAtTerminalWaypoint(object, waypointPatrol)[1]).toBe(2);
  });

  it("isPatrolInRestrictor should correctly check if all patrol points are in restrictor", () => {
    expect(isPatrolInRestrictor("some_restrictor", "some_patrol")).toBeNull();
    expect(isPatrolInRestrictor("some_restrictor", "another_patrol")).toBeNull();

    const zone: GameObject = MockGameObject.mock({ name: () => "test_restrictor" });

    registerZone(zone);

    jest.spyOn(zone, "inside").mockImplementation(() => false);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_surge_1_walk")).toBe(false);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_sleep_1")).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation((it) => it.x === 212 && it.y === -14 && it.z === 31);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_sleep_1")).toBe(true);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_surge_1_walk")).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation((it) => it.x === 21 && it.y === -1 && it.z === 31);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_sleep_1")).toBe(false);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_surge_1_walk")).toBe(false);

    jest
      .spyOn(zone, "inside")
      .mockImplementation(
        (it) => (it.x === 21 && it.y === -1 && it.z === 31) || (it.x === -5 && it.y === 44 && it.z === -21)
      );
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_sleep_1")).toBe(false);
    expect(isPatrolInRestrictor("test_restrictor", "test_smart_surge_1_walk")).toBe(true);
  });

  it.todo("choosePatrolWaypointByFlags should correctly choose points matching flags");
});
