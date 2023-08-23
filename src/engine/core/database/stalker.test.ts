import { describe, expect, it, jest } from "@jest/globals";
import { anim, move } from "xray16";

import { registry } from "@/engine/core/database/registry";
import {
  getStalkerState,
  registerStalker,
  resetStalkerState,
  setStalkerState,
  unregisterStalker,
} from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'stalker' module of the database", () => {
  it("should correctly register actor", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

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

  it("should correctly get and set state", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

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

  it("should correctly reset state", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;

    jest.spyOn(manager, "setState");
    jest.spyOn(manager, "update");
    jest.spyOn(manager.animation, "setControl");
    jest.spyOn(manager.animation, "setState");
    jest.spyOn(manager.animstate, "setControl");
    jest.spyOn(manager.animstate, "setState");

    resetStalkerState(stalker.object);

    expect(manager.setState).toHaveBeenCalledWith(EStalkerState.IDLE, null, null, null, { isForced: true });
    expect(manager.update).toHaveBeenCalledTimes(7);

    expect(manager.animstate.setControl).toHaveBeenCalled();
    expect(manager.animstate.setState).toHaveBeenCalledWith(null, true);
    expect(manager.animation.setControl).toHaveBeenCalled();
    expect(manager.animation.setState).toHaveBeenCalledWith(null, true);

    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.standing);
    expect(stalker.object.set_mental_state).toHaveBeenCalledWith(anim.free);

    unregisterStalker(stalker);
  });
});
