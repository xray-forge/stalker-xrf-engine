import { describe, expect, it, jest } from "@jest/globals";
import { callback } from "xray16";
import { GameObject } from "xray16/alias";
import { LuaArray, Nillable, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { StalkerAnimationController } from "@/engine/core/ai/state/StalkerAnimationController";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import {
  EAnimationMarker,
  EAnimationType,
  EStalkerState,
  IAnimationDescriptor,
  TAnimationSequenceElements,
} from "@/engine/core/animation/types";

function mockDescriptor(moving: Nillable<boolean> = null): IAnimationDescriptor {
  return {
    prop: { maxidle: 0, sumidle: 0, rnd: null, moving },
    into: null,
    out: null,
    idle: null,
    rnd: null,
  };
}

function mockController(): [GameObject, StalkerStateController, StalkerAnimationController] {
  const object: GameObject = MockGameObject.mock();
  const stateController: StalkerStateController = new StalkerStateController(object);

  return [object, stateController, stateController.animationController];
}

describe("StalkerAnimationController", () => {
  describe("constructor", () => {
    it("initializes an animation controller for the supplied object and state controller", () => {
      const [object, stateController, controller] = mockController();

      expect(controller.object).toBe(object);
      expect(controller.stateController).toBe(stateController);
      expect(controller.type).toBe(EAnimationType.ANIMATION);
      expect(controller.state.currentState).toBeNull();
      expect(controller.state.targetState).toBeNull();
    });
  });

  describe("setControl", () => {
    it("makes the controller active, registers its callback, and clears the animstate marker", () => {
      const [object, stateController, controller] = mockController();

      controller.state.animationMarker = EAnimationMarker.IN;
      stateController.animstateController.state.animationMarker = EAnimationMarker.IDLE;

      controller.setControl();

      expect(stateController.activeAnimationType).toBe(EAnimationType.ANIMATION);
      expect(object.set_callback).toHaveBeenCalledWith(
        callback.script_animation,
        controller.onAnimationCallback,
        controller
      );
      expect(stateController.animstateController.state.animationMarker).toBeNull();
    });
  });

  describe("setState", () => {
    it("forces the requested state immediately and resets transition state", () => {
      const [object, , controller] = mockController();

      controller.state.animationMarker = EAnimationMarker.IN;
      controller.state.sequenceId = 2;

      controller.setState(EStalkerState.GUARD, true);

      expect(object.clear_animations).toHaveBeenCalled();
      expect(controller.state.animationMarker).toBeNull();
      expect(controller.state.currentState).toBe(EStalkerState.GUARD);
      expect(controller.state.targetState).toBe(EStalkerState.GUARD);
      expect(controller.state.sequenceId).toBe(1);
    });
  });

  describe("addAnimation", () => {
    it("uses the moving flag for regular animations", () => {
      const [object, , controller] = mockController();

      controller.addAnimation("guard_idle" as TName, mockDescriptor(true));

      expect(object.add_animation).toHaveBeenCalledWith("guard_idle", true, true);
    });

    it("uses the configured local position and direction once", () => {
      const [object, stateController, controller] = mockController();

      stateController.animationPosition = { x: 1, y: 2, z: 3 } as any;
      stateController.animationDirection = { x: 0, y: 0, z: 1 } as any;

      controller.addAnimation("guard_idle" as TName, mockDescriptor());

      expect(stateController.isAnimationDirectionApplied).toBe(true);
      expect(object.add_animation).toHaveBeenCalledWith(
        "guard_idle",
        true,
        stateController.animationPosition,
        expect.anything(),
        true
      );
    });
  });

  describe("getAnimationForWeaponSlot", () => {
    it("falls back to the default weapon slot when the requested slot is absent", () => {
      const [, , controller] = mockController();
      const animationList: LuaArray<TAnimationSequenceElements> = new LuaTable();

      animationList.set(0, ["default" as TName] as any);
      animationList.set(3, ["secondary" as TName] as any);

      expect(controller.getAnimationForWeaponSlot(1, animationList)?.get(1)).toBe("default");
      expect(controller.getAnimationForWeaponSlot(3, animationList)?.get(1)).toBe("secondary");
    });
  });

  describe("updateAnimation", () => {
    it("adds the selected animation when one is available", () => {
      const [, , controller] = mockController();
      const descriptor: IAnimationDescriptor = mockDescriptor();

      jest.spyOn(controller, "selectAnimation").mockReturnValue(["guard_idle" as TName, descriptor] as any);

      const addAnimation = jest.spyOn(controller, "addAnimation");

      controller.updateAnimation();

      expect(addAnimation).toHaveBeenCalledWith("guard_idle", descriptor);
    });
  });

  describe("selectRandom", () => {
    it("selects the only available random animation", () => {
      const [, , controller] = mockController();
      const descriptor: IAnimationDescriptor = mockDescriptor();
      const randomAnimations: LuaArray<TAnimationSequenceElements> = $fromArray([
        "guard_random" as TName,
      ]) as unknown as LuaArray<TAnimationSequenceElements>;

      descriptor.rnd = randomAnimations;
      controller.state.currentState = EStalkerState.GUARD;
      jest.spyOn(controller, "getAnimationForWeaponSlot").mockReturnValue(randomAnimations);

      expect(controller.selectRandom(descriptor, 0, true)).toBe("guard_random");
    });
  });

  describe("selectAnimation", () => {
    it("returns no animation while both current and target states are empty", () => {
      const [, , controller] = mockController();

      expect(controller.selectAnimation()).toEqual([null, null]);
    });
  });

  describe("processSpecialAction", () => {
    it("invokes a custom animation callback with the controlled object", () => {
      const [object, , controller] = mockController();
      const animationCallback = jest.fn();
      const action: LuaTable = new LuaTable();

      action.set("f", animationCallback);
      controller.processSpecialAction(action);

      expect(animationCallback).toHaveBeenCalledWith(object);
    });
  });

  describe("onAnimationCallback", () => {
    it("releases animation control to the animstate controller after an out transition", () => {
      const [object, stateController, controller] = mockController();

      controller.state.animationMarker = EAnimationMarker.OUT;
      controller.state.currentState = EStalkerState.GUARD;
      controller.state.targetState = null;
      jest.spyOn(object, "animation_count").mockReturnValue(0);

      const setControl = jest.spyOn(stateController.animstateController, "setControl");

      controller.onAnimationCallback(true);

      expect(controller.state.animationMarker).toBeNull();
      expect(controller.state.currentState).toBeNull();
      expect(setControl).toHaveBeenCalled();
    });
  });
});
