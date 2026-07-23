import { describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { Flags32, GameObject, Patrol, Vector } from "xray16/alias";
import { getPatrolFlag, isObjectAtTerminalWaypoint, isObjectAtWaypoint, LuaArray } from "xray16/lib";
import { MockFlags32, MockGameObject } from "xray16/mocks";

import { registerZone } from "@/engine/core/database";
import { IWaypointData } from "@/engine/core/ini";
import { choosePatrolWaypointByFlags, isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { patrols } from "@/fixtures/engine";

describe("isObjectAtWaypoint", () => {
  it("should correctly check whether object is at waypoint", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.131);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 1)).toBe(false);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[1].position);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.13);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 2)).toBe(true);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[2].position);
  });
});

describe("isObjectAtTerminalWaypoint", () => {
  it("should correctly check whether object is at terminal waypoint", () => {
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
});

describe("isPatrolInRestrictor", () => {
  it("should correctly check if all patrol points are in restrictor", () => {
    expect(isPatrolInRestrictor(null, "test_smart_sleep_1")).toBeNull();
    expect(isPatrolInRestrictor("some_restrictor", "some_patrol")).toBeNull();
    expect(isPatrolInRestrictor("some_restrictor", "another_patrol")).toBeNull();

    const zone: GameObject = MockGameObject.mock({ name: "test_restrictor" });

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
});

describe("choosePatrolWaypointByFlags", () => {
  it("should select a matching point using its configured weight", () => {
    const points: LuaArray<IWaypointData> = new LuaTable();
    const flags: Flags32 = MockFlags32.mock(4);

    points.set(0, { flags: MockFlags32.mock(4), p: "20" } as IWaypointData);
    points.set(1, { flags: MockFlags32.mock(8), p: "100" } as IWaypointData);
    points.set(2, { flags: MockFlags32.mock(4), p: "80" } as IWaypointData);

    jest
      .spyOn(math, "random")
      .mockImplementationOnce(() => 1)
      .mockImplementationOnce(() => 80);

    expect(choosePatrolWaypointByFlags(new patrol("test-wp"), points, flags)).toEqual([2, 2]);
  });

  it("should report no selection when no patrol point has the requested flags", () => {
    const points: LuaArray<IWaypointData> = new LuaTable();

    points.set(0, { flags: MockFlags32.mock(8), p: null } as IWaypointData);
    points.set(1, { flags: MockFlags32.mock(16), p: null } as IWaypointData);
    points.set(2, { flags: MockFlags32.mock(32), p: null } as IWaypointData);

    expect(choosePatrolWaypointByFlags(new patrol("test-wp"), points, MockFlags32.mock(4))).toEqual([null, 0]);
  });
});

describe("getPatrolFlag", () => {
  it("should correctly choose patrol point flag bit", () => {
    const path: Patrol = new patrol("test-wp");

    expect(getPatrolFlag(path, 0)).toBe(3);
    expect(getPatrolFlag(path, 1)).toBe(15);
    expect(getPatrolFlag(path, 2)).toBeNull();
  });
});
