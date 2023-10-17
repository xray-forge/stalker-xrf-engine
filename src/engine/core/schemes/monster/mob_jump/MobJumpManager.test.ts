import { describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { EMobJumpState, ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/mob_jump_types";
import { MobJumpManager } from "@/engine/core/schemes/monster/mob_jump/MobJumpManager";
import { createVector } from "@/engine/core/utils/vector";
import { EntityAction, EScheme, GameObject, TName } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

describe("MobJumpManager", () => {
  it("should correctly fail on not existing patrol", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {});
    const manager: MobJumpManager = new MobJumpManager(object, state);

    expect(() => manager.activate()).toThrow();
    expect(state.jumpPathName).toBe("[not-defined]");
  });

  it("should correctly activate", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {
      jumpPathName: "test-wp",
      signals: $fromObject<TName, boolean>({ a: true }),
      offset: createVector(-1, -2, -3),
    });
    const manager: MobJumpManager = new MobJumpManager(object, state);

    manager.activate();

    expect(object.script).toHaveBeenCalledWith(true, "MobJumpManager");
    expect(manager.jumpState).toBe(EMobJumpState.START_LOOK);
    expect(manager.jumpPath).toBeInstanceOf(patrol);
    expect(manager.point).toEqual({ x: 0, y: -1, z: -2 });
    expect(state.jumpPathName).toBe("test-wp");
    expect(state.signals).toEqualLuaTables({});
  });

  it("should correctly process jump", () => {
    const object: GameObject = mockGameObject({ action: () => null as unknown as EntityAction });
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {
      jumpPathName: "test-wp",
      signals: $fromObject<TName, boolean>({ a: true }),
      offset: createVector(-1, -2, -3),
    });
    const manager: MobJumpManager = new MobJumpManager(object, state);

    manager.activate();
    expect(object.script).toHaveBeenCalledTimes(1);
    expect(object.script).toHaveBeenCalledWith(true, "MobJumpManager");

    jest.spyOn(object, "get_script").mockImplementation(() => true);
    jest.spyOn(object, "get_script_name").mockImplementation(() => "MobJumpManager");

    manager.update();

    expect(object.command).toHaveBeenCalledTimes(1);
    expect(manager.jumpState).toBe(EMobJumpState.WAIT_LOOK_END);
    expect(object.jump).toHaveBeenCalledTimes(0);
    expect(state.signals).toEqualLuaTables({});
    expect(object.script).toHaveBeenCalledTimes(1);

    manager.update();
    expect(manager.jumpState).toBe(EMobJumpState.JUMP);
    expect(object.jump).toHaveBeenCalledTimes(1);
    expect(state.signals).toEqualLuaTables({ jumped: true });
    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledWith(false, "MobJumpManager");
  });
});
