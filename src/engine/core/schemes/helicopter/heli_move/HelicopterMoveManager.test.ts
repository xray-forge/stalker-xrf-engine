import { describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockCHelicopter, MockGameObject } from "@/fixtures/xray";

describe("HelicopterMoveManager", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeHelicopterMoveState = mockSchemeState(EScheme.HELI_MOVE);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    const manager: HelicopterMoveManager = new HelicopterMoveManager(object, state);

    expect(manager.helicopter).toBeInstanceOf(CHelicopter);

    expect(manager.helicopterFireManager).toBeInstanceOf(HelicopterFireManager);
    expect(manager.helicopterFlyManager).toBeInstanceOf(HelicopterFlyManager);

    expect(manager.isHelicopterMoving).toBe(false);
    expect(manager.isWaypointCallbackHandled).toBe(false);

    expect(manager.patrolMove).toBeNull();
    expect(manager.patrolMoveInfo).toBeNull();
    expect(manager.patrolLook).toBeNull();

    expect(manager.lastIndex).toBeNull();
    expect(manager.nextIndex).toBeNull();
    expect(manager.maxVelocity).toBeUndefined();
    expect(manager.flagToWpCallback).toBeNull();
    expect(manager.byStopFireFly).toBeNull();
    expect(manager.stopPoint).toBeNull();
  });

  it.todo("should correctly activate");

  it.todo("should correctly handle save/load");

  it.todo("should correctly handle update");

  it.todo("should correctly handle update movement state");

  it.todo("should correctly handle update look state");

  it.todo("should correctly handle waypoint callback");
});
