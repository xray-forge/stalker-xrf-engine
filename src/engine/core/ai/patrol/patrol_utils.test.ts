import { describe, expect, it } from "@jest/globals";

import { isPatrolTeamSynchronized } from "@/engine/core/ai/patrol/patrol_utils";
import { patrolConfig } from "@/engine/core/ai/patrol/PatrolConfig";
import { GameObject, TNumberId } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("patrol_utils module", () => {
  it("isPatrolTeamSynchronized should correctly check team sync state", () => {
    const first: GameObject = mockGameObject();
    const second: GameObject = mockGameObject();

    expect(isPatrolTeamSynchronized(null)).toBe(true); // no team
    expect(isPatrolTeamSynchronized("not_existing")).toBe(true);

    patrolConfig.PATROL_TEAMS.set("empty", new LuaTable());
    expect(isPatrolTeamSynchronized("empty")).toBe(true);

    patrolConfig.PATROL_TEAMS.set(
      "not_sync",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: false })
    );
    expect(isPatrolTeamSynchronized("not_sync")).toBe(false);

    patrolConfig.PATROL_TEAMS.set(
      "partial_sync",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true })
    );
    expect(isPatrolTeamSynchronized("partial_sync")).toBe(false);

    patrolConfig.PATROL_TEAMS.set("sync", $fromObject<TNumberId, boolean>({ [first.id()]: true, [second.id()]: true }));
    expect(isPatrolTeamSynchronized("sync")).toBe(true);
  });

  it("isPatrolTeamSynchronized should correctly check team sync for dead/offline objects", () => {
    const first: GameObject = mockGameObject({ alive: () => false });
    const second: GameObject = mockGameObject();

    patrolConfig.PATROL_TEAMS.set(
      "not_sync_dead",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true, 1: false })
    );
    expect(isPatrolTeamSynchronized("not_sync_dead")).toBe(true);

    expect(patrolConfig.PATROL_TEAMS.get("not_sync_dead")).toEqualLuaTables({ [second.id()]: true });
  });
});
