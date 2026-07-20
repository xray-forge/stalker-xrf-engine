import { describe, expect, it, jest } from "@jest/globals";
import { anim, move } from "xray16";
import { createEmptyVector } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types/state_types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import {
  getStalkerState,
  registerStalker,
  resetStalkerState,
  setStalkerState,
  unregisterStalker,
} from "@/engine/core/database/stalker";

describe("registerStalker", () => {
  it("should correctly register stalker", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(stalker.object.id())).toEqual({ object: stalker.object });
    expect(registry.stalkers.get(stalker.object.id())).toBe(true);

    unregisterStalker(stalker);

    expect(registry.objects.length()).toBe(0);

    registerStalker(stalker);
    unregisterStalker(stalker, false);

    expect(registry.objects.length()).toBe(1);
    expect(registry.stalkers.get(stalker.object.id())).toBeNull();
    expect(registry.objects.get(stalker.object.id())).toEqual({ object: stalker.object });
  });
});

describe("setStalkerState", () => {
  it("should correctly set state", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;

    expect(manager).toBeDefined();

    expect(manager.targetState).toBe(EStalkerState.IDLE);
    expect(getStalkerState(stalker.object)).toBe(EStalkerState.IDLE);

    jest.spyOn(manager, "setState");

    const callbackPlaceholder = jest.fn();

    setStalkerState(
      stalker.object,
      EStalkerState.RAID_FIRE,
      {
        turnEndCallback: callbackPlaceholder,
        context: { test: true },
        begin: 10,
        timeout: 15,
        callback: callbackPlaceholder,
      },
      1000,
      { lookObjectId: null, lookPosition: createEmptyVector() },
      { isForced: true }
    );

    expect(manager.targetState).toBe(EStalkerState.RAID_FIRE);
    expect(getStalkerState(stalker.object)).toBe(EStalkerState.RAID_FIRE);
    expect(manager.setState).toHaveBeenCalledTimes(1);
    expect(manager.setState).toHaveBeenCalledWith(
      "raid_fire",
      {
        begin: null,
        callback: callbackPlaceholder,
        context: { test: true },
        timeout: 1000,
        turnEndCallback: callbackPlaceholder,
      },
      1000,
      { lookObjectId: null, lookPosition: { x: 0, y: 0, z: 0 } },
      { isForced: true }
    );

    expect(callbackPlaceholder).not.toHaveBeenCalled();

    unregisterStalker(stalker);
  });
});

describe("resetStalkerState", () => {
  it("should correctly reset state", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;

    jest.spyOn(manager, "setState");
    jest.spyOn(manager, "update");
    jest.spyOn(manager.animationController, "setControl");
    jest.spyOn(manager.animationController, "setState");
    jest.spyOn(manager.animstateController, "setControl");
    jest.spyOn(manager.animstateController, "setState");

    resetStalkerState(stalker.object);

    expect(manager.setState).toHaveBeenCalledWith(EStalkerState.IDLE, null, null, null, { isForced: true });
    expect(manager.update).toHaveBeenCalledTimes(7);

    expect(manager.animstateController.setControl).toHaveBeenCalled();
    expect(manager.animstateController.setState).toHaveBeenCalledWith(null, true);
    expect(manager.animationController.setControl).toHaveBeenCalled();
    expect(manager.animationController.setState).toHaveBeenCalledWith(null, true);

    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.standing);
    expect(stalker.object.set_mental_state).toHaveBeenCalledWith(anim.free);

    unregisterStalker(stalker);
  });
});

describe("resetStalkerState", () => {
  it("should not throw when state controller does not exist", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    expect(() => resetStalkerState(stalker.object)).not.toThrow();
  });
});
