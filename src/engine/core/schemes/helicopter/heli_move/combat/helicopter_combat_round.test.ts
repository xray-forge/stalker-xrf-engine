import { describe, expect, it } from "@jest/globals";

import { initializeHelicopterCombatRound } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_round";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("initializeHelicopterCombatRound", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const enemy: GameObject = MockGameObject.mock();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemy = enemy;
    manager.enemyLastSeenPos = MockVector.mock(1, 0, 1);
    manager.roundVelocity = 45;

    initializeHelicopterCombatRound(manager);

    expect(manager.isRoundInitialized).toBe(true);
    expect(manager.changeDirTime).toBe(0);
    expect(manager.changePosTime).toBe(0);
    expect(manager.centerPos).toBe(manager.enemyLastSeenPos);
    expect(typeof manager.flightDirection).toBe("boolean");
    expect(manager.changeCombatTypeAllowed).toBe(true);
    expect(manager.roundBeginShootTime).toBe(0);

    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(45);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(45);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.UseFireTrail).toHaveBeenCalledWith(false);

    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledTimes(1);
    expect(manager.helicopter.GoPatrolByRoundPath).toHaveBeenCalledTimes(1);
  });
});
