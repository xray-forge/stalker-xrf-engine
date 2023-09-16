import { describe, expect, it, jest } from "@jest/globals";

import { registerZone, registry } from "@/engine/core/database";
import { isPatrolInRestrictor, isPatrolTeamSynchronized } from "@/engine/core/utils/patrol";
import { ClientObject, TNumberId } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("patrol utils", () => {
  it("'isPatrolInRestrictor' should correctly check if all patrol points are in restrictor", () => {
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

  it.todo("'chooseLookPoint' should correctly choose points");

  it.todo("'isObjectStandingOnTerminalWaypoint' should correctly check terminal waypoints and object standing");

  it("'isPatrolTeamSynchronized' should correctly check team sync state", () => {
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

  it("'isPatrolTeamSynchronized' should correctly check team sync for dead/offline objects", () => {
    const first: ClientObject = mockClientGameObject({ alive: () => false });
    const second: ClientObject = mockClientGameObject();

    registry.patrolSynchronization.set(
      "not_sync_dead",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true, 1: false })
    );
    expect(isPatrolTeamSynchronized("not_sync_dead")).toBe(true);

    expect(registry.patrolSynchronization.get("not_sync_dead")).toEqualLuaTables({ [second.id()]: true });
  });
});
