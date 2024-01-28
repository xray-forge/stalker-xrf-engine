import { describe, expect, it } from "@jest/globals";

import { isPatrolTeamSynchronized } from "@/engine/core/ai/patrol/patrol_utils";
import { patrolConfig } from "@/engine/core/ai/patrol/PatrolConfig";
import { GameObject, TNumberId } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("isPatrolTeamSynchronized util", () => {
  it("should correctly check team sync state", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

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

  it("should correctly check team sync for dead/offline objects", () => {
    const first: GameObject = MockGameObject.mock({ alive: false });
    const second: GameObject = MockGameObject.mock();

    patrolConfig.PATROL_TEAMS.set(
      "not_sync_dead",
      $fromObject<TNumberId, boolean>({ [first.id()]: false, [second.id()]: true, 1: false })
    );
    expect(isPatrolTeamSynchronized("not_sync_dead")).toBe(true);

    expect(patrolConfig.PATROL_TEAMS.get("not_sync_dead")).toEqualLuaTables({ [second.id()]: true });
  });
});
