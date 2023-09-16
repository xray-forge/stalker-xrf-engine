import { describe, expect, it, jest } from "@jest/globals";
import { callback } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerPatrolManager } from "@/engine/core/objects/ai/state/StalkerPatrolManager";
import { ClientObject, EClientObjectPath } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("StalkerPatrolManager class", () => {
  it("should correctly initialize", () => {
    const object: ClientObject = mockClientGameObject();
    const manager: StalkerPatrolManager = new StalkerPatrolManager(object);

    expect(manager.object).toBe(object);

    manager.initialize();

    expect(object.set_callback).toHaveBeenCalledWith(callback.patrol_path_in_point, manager.onWalkWaypoint, manager);
  });

  it("should correctly finalize", () => {
    const object: ClientObject = mockClientGameObject();
    const manager: StalkerPatrolManager = new StalkerPatrolManager(object);

    manager.finalize();
    expect(object.set_path_type).toHaveBeenCalledWith(EClientObjectPath.LEVEL_PATH);
  });

  it("should correctly finalize with team", () => {
    const object: ClientObject = mockClientGameObject();
    const manager: StalkerPatrolManager = new StalkerPatrolManager(object);

    manager.team = "some_team";
    registry.patrolSynchronization.set("some_team", new LuaTable());
    registry.patrolSynchronization.get("some_team").set(object.id(), true);

    manager.finalize();
    expect(object.set_path_type).toHaveBeenCalledWith(EClientObjectPath.LEVEL_PATH);
    expect(registry.patrolSynchronization.get("some_team")).toEqualLuaTables({});
  });

  it.todo("should correctly reset");

  it.todo("should correctly setup");

  it.todo("should correctly handle update");

  it.todo("should correctly handle animation end");

  it.todo("should correctly handle animation turn end");

  it.todo("should correctly handle walk waypoints");

  it.todo("should correctly handle look waypoints");

  it("should correctly handle extrapolation", () => {
    const object: ClientObject = mockClientGameObject();
    const manager: StalkerPatrolManager = new StalkerPatrolManager(object);

    jest.spyOn(Date, "now").mockImplementation(() => 4125);
    jest.spyOn(object, "get_current_point_index").mockImplementation(() => 3);

    expect(manager.canUseGetCurrentPointIndex).toBe(false);
    expect(manager.currentPointInitAt).toBe(0);
    expect(manager.currentPointIndex).toBeNull();

    manager.onExtrapolate(object, 10);

    expect(manager.canUseGetCurrentPointIndex).toBe(true);
    expect(manager.currentPointInitAt).toBe(4125);
    expect(manager.currentPointIndex).toBe(3);
  });
});
