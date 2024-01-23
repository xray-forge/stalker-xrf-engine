import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { HelicopterBinder } from "@/engine/core/binders/helicopter/HelicopterBinder";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, ESchemeEvent, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme");

describe("HelicopterBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(emitSchemeEvent);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);

    expect(binder.inInitialized).toBe(false);
    expect(binder.isLoaded).toBe(false);
    expect(binder.flameStartHealth).toBe(0);
    expect(binder.helicopter).toBeInstanceOf(CHelicopter);
    expect(binder.helicopterFireManager).toBeInstanceOf(HelicopterFireManager);
  });

  it.todo("should correctly handle update event");

  it.todo("should correctly handle going online and offline");

  it("should be net save relevant", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });

  it.todo("should correctly handle save/load events");

  it.todo("should correctly check health and start burning");

  it("should correctly handle hit events", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mockStalker();
    const binder: HelicopterBinder = new HelicopterBinder(object);
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HIT);

    state.activeScheme = EScheme.HIT;
    state[EScheme.HIT] = schemeState;
    binder.state = state;

    jest.spyOn(binder.helicopterFireManager, "onHit").mockImplementation(jest.fn());

    binder.onHit(0.5, 1, 10, enemy.id());

    expect(binder.helicopterFireManager.enemy).toBe(enemy);
    expect(binder.helicopterFireManager.onHit).toHaveBeenCalledTimes(1);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(object, schemeState, ESchemeEvent.HIT, object, 0.5, null, enemy, null);
  });

  it("should correctly handle waypoint events", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const binder: HelicopterBinder = new HelicopterBinder(object);
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);

    state.activeScheme = EScheme.HELI_MOVE;
    state[EScheme.HELI_MOVE] = schemeState;

    binder.state = state;
    binder.onWaypoint(10, ZERO_VECTOR, 4);

    expect(emitSchemeEvent).toHaveBeenCalledTimes(1);
    expect(emitSchemeEvent).toHaveBeenCalledWith(object, schemeState, ESchemeEvent.WAYPOINT, object, null, 4);
  });
});
