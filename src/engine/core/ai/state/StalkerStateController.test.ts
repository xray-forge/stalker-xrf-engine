import { describe, expect, it, jest } from "@jest/globals";
import { look } from "xray16";
import { GameObject } from "xray16/alias";
import { createVector } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { StalkerAnimationController } from "@/engine/core/ai/state/StalkerAnimationController";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EAnimationType, EStalkerState } from "@/engine/core/animation/types";

describe("StalkerStateController", () => {
  it("initializes state and animation controllers for its object", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: StalkerStateController = new StalkerStateController(object);

    expect(manager.object).toBe(object);
    expect(manager.getState()).toBe(EStalkerState.IDLE);
    expect(manager.animstateController).toBeInstanceOf(StalkerAnimationController);
    expect(manager.animstateController.type).toBe(EAnimationType.ANIMSTATE);
    expect(manager.animationController).toBeInstanceOf(StalkerAnimationController);
    expect(manager.animationController.type).toBe(EAnimationType.ANIMATION);
  });

  it("updates its target state and look target", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: StalkerStateController = new StalkerStateController(object);
    const lookPosition = createVector(1, 2, 3);

    manager.setState(EStalkerState.GUARD, null, null, { lookPosition, lookObjectId: null }, { isForced: true });

    expect(manager.getState()).toBe(EStalkerState.GUARD);
    expect(manager.lookPosition).toBe(lookPosition);
    expect(manager.lookObjectId).toBeNull();
    expect(manager.isForced).toBe(true);
  });

  it("invokes an animation callback once after its timeout, including from timestamp zero", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: StalkerStateController = new StalkerStateController(object);
    const callback = jest.fn();

    manager.setState(
      EStalkerState.GUARD,
      { context: manager, callback, begin: null, timeout: null, turnEndCallback: null },
      100,
      null,
      null
    );
    manager.animationController.state.currentState = states.get(EStalkerState.GUARD).animation as EStalkerState;

    jest.spyOn(Date, "now").mockImplementation(() => 0);
    manager.update();

    expect(callback).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 100);
    manager.update();

    expect(callback).toHaveBeenCalledWith();
    expect(callback.mock.contexts).toEqual([manager]);
    expect(manager.callback?.callback).toBeNull();
  });

  it("keeps callbacks pending until the requested animation is active", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: StalkerStateController = new StalkerStateController(object);
    const callback = jest.fn();

    manager.setState(
      EStalkerState.GUARD,
      { context: manager, callback, begin: null, timeout: null, turnEndCallback: null },
      0,
      null,
      null
    );
    manager.animationController.state.currentState = null;

    manager.update();

    expect(callback).not.toHaveBeenCalled();
    expect(manager.callback?.begin).toBeNull();
  });

  it("turns towards the configured look position", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: StalkerStateController = new StalkerStateController(object);

    manager.targetState = EStalkerState.IDLE;
    manager.lookPosition = createVector(1, 0, 0);
    manager.lookObjectId = null;

    manager.turn();

    expect(object.set_sight).toHaveBeenCalledWith(look.direction, expect.anything(), true);
  });
});
