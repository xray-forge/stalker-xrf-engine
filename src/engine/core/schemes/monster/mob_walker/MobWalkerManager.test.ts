import { describe, expect, it } from "@jest/globals";
import { clsid, patrol } from "xray16";

import { EMobWalkerState, ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/mob_walker_types";
import { MobWalkerManager } from "@/engine/core/schemes/monster/mob_walker/MobWalkerManager";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { ClientObject, EScheme, TName } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("MobWalkerManager", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject({ clsid: () => clsid.bloodsucker_s });
    const state: ISchemeMobWalkerState = mockSchemeState<ISchemeMobWalkerState>(EScheme.MOB_REMARK, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.NONE,
      pathWalk: "test-wp",
      pathLook: "test-wp-2",
    });
    const manager: MobWalkerManager = new MobWalkerManager(object, state);

    manager.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(manager.patrolWalk).toBeInstanceOf(patrol);
    expect(manager.patrolLook).toBeInstanceOf(patrol);
    expect(manager.pathWalkInfo?.length()).toBe(3);
    expect(manager.pathLookInfo?.length()).toBe(3);
    expect(manager.mobState).toBe(EMobWalkerState.MOVING);
    expect(manager.crouch).toBe(false);
    expect(manager.running).toBe(false);
    expect(manager.curAnimSet).toBe(0);
    expect(manager.ptWaitTime).toBe(5000);
    expect(manager.scheduledSound).toBeNull();
    expect(manager.lastIndex).toBeNull();
    expect(manager.lastLookIndex).toBeNull();

    expect(object.script).toHaveBeenCalledWith(true, "xrf");
    expect(object.command).toHaveBeenCalledTimes(1);
  });
});
