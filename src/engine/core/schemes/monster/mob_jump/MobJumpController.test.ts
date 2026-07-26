import { describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { createVector, TName } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { EMobJumpState, ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/mob_jump_types";
import { MobJumpController } from "@/engine/core/schemes/monster/mob_jump/MobJumpController";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

describe("MobJumpController", () => {
  it("should correctly fail on not existing patrol", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {});
    const controller: MobJumpController = new MobJumpController(object, state);

    expect(() => controller.activate()).toThrow();
    expect(state.jumpPathName).toBe("[not-defined]");
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {
      jumpPathName: "test-wp",
      signals: $fromObject<TName, boolean>({ a: true }),
      offset: createVector(-1, -2, -3),
    });
    const controller: MobJumpController = new MobJumpController(object, state);

    controller.activate();

    expect(object.script).toHaveBeenCalledWith(true, "MobJumpController");
    expect(controller.jumpState).toBe(EMobJumpState.START_LOOK);
    expect(controller.jumpPath).toBeInstanceOf(patrol);
    expect(controller.point).toEqual({ x: 0, y: -1, z: -2 });
    expect(state.jumpPathName).toBe("test-wp");
    expect(state.signals).toEqualLuaTables({});
  });

  it("should correctly process jump", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobJumpState = mockSchemeState<ISchemeMobJumpState>(EScheme.MOB_JUMP, {
      jumpPathName: "test-wp",
      signals: $fromObject<TName, boolean>({ a: true }),
      offset: createVector(-1, -2, -3),
    });
    const controller: MobJumpController = new MobJumpController(object, state);

    controller.activate();
    expect(object.script).toHaveBeenCalledTimes(1);
    expect(object.script).toHaveBeenCalledWith(true, "MobJumpController");

    jest.spyOn(object, "get_script").mockImplementation(() => true);
    jest.spyOn(object, "get_script_name").mockImplementation(() => "MobJumpController");

    controller.update();

    expect(object.command).toHaveBeenCalledTimes(1);
    expect(controller.jumpState).toBe(EMobJumpState.WAIT_LOOK_END);
    expect(object.jump).toHaveBeenCalledTimes(0);
    expect(state.signals).toEqualLuaTables({});
    expect(object.script).toHaveBeenCalledTimes(1);

    controller.update();
    expect(controller.jumpState).toBe(EMobJumpState.JUMP);
    expect(object.jump).toHaveBeenCalledTimes(1);
    expect(state.signals).toEqualLuaTables({ jumped: true });
    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenCalledWith(false, "MobJumpController");
  });
});
