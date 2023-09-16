import { describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { registerZone, registry } from "@/engine/core/database";
import {
  isObjectAtTerminalWaypoint,
  isObjectAtWaypoint,
  isPatrolInRestrictor,
  isPatrolTeamSynchronized,
} from "@/engine/core/utils/patrol";
import { ClientObject, Patrol, TNumberId, Vector } from "@/engine/lib/types";
import { mockClientGameObject, patrols } from "@/fixtures/xray";

describe("patrol utils", () => {
  it("isObjectAtWaypoint should correctly check whether object is at waypoint", () => {
    const object: ClientObject = mockClientGameObject();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.131);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 1)).toBe(false);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[1].position);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0.13);

    expect(isObjectAtWaypoint(object, new patrol("test-wp"), 2)).toBe(true);
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(patrols["test-wp"].points[2].position);
  });

  it("isObjectAtTerminalWaypoint should correctly check whether object is at terminal waypoint", () => {
    const object: ClientObject = mockClientGameObject();
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

    const zone: ClientObject = mockClientGameObject({ name: () => "test_restrictor" });

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

  it("isPatrolTeamSynchronized should correctly check team sync state", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(isPatrolTeamSynchronized(null)).toBe(true); // no team
    expect(isPatrolTeamSynchronized("not_existing")).toBe(true);

    registry.patrolSynchronization.set("empty", new LuaTable());
    expect(isPatrolTeamSynchronized("empty")).toBe(true);

    registry.patrolSynchronization.set(
      "not_sync",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: false })
    );
    expect(isPatrolTeamSynchronized("not_sync")).toBe(false);

    registry.patrolSynchronization.set(
      "partial_sync",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true })
    );
    expect(isPatrolTeamSynchronized("partial_sync")).toBe(false);

    registry.patrolSynchronization.set(
      "sync",
      $fromObject<TNumberId, boolean>({ [first.id()]: true, [second.id()]: true })
    );
    expect(isPatrolTeamSynchronized("sync")).toBe(true);
  });

  it("isPatrolTeamSynchronized should correctly check team sync for dead/offline objects", () => {
    const first: ClientObject = mockClientGameObject({ alive: () => false });
    const second: ClientObject = mockClientGameObject();

    registry.patrolSynchronization.set(
      "not_sync_dead",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true, 1: false })
    );
    expect(isPatrolTeamSynchronized("not_sync_dead")).toBe(true);

    expect(registry.patrolSynchronization.get("not_sync_dead")).toEqualLuaTables({ [second.id()]: true });
  });

  it.todo("choosePatrolWaypointByFlags should correctly choose points matching flags");
});
