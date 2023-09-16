import { describe, expect, it } from "@jest/globals";
import { callback } from "xray16";

import { StalkerPatrolManager } from "@/engine/core/objects/ai/state/StalkerPatrolManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("StalkerPatrolManager class", () => {
  it("should correctly initialize", () => {
    const object: ClientObject = mockClientGameObject();
    const manager: StalkerPatrolManager = new StalkerPatrolManager(object);

    expect(manager.object).toBe(object);

    manager.initialize();

    expect(object.set_callback).toHaveBeenCalledWith(callback.patrol_path_in_point, manager.onWaypoint, manager);
  });

  it.todo("should correctly reset");

  it.todo("should correctly choose look points for patrols");

  it.todo("should correctly handle updating");

  it.todo("should correctly check if arrived to waypoint");

  it.todo("should correctly check if standing on terminal point");

  it.todo("should correctly check if is synchronized");

  it.todo("should correctly update movement states");

  it.todo("should correctly update standing states");

  it.todo("should correctly setup movement by patrol paths");

  it.todo("should correctly set scheme signals");

  it.todo("should correctly handle animation updates");

  it.todo("should correctly handle animation end");

  it.todo("should correctly handle extrapolation");

  it.todo("should correctly handle waypoints");
});
