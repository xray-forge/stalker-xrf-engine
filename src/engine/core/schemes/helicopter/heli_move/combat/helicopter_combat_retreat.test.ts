import { describe, expect, it } from "@jest/globals";

import { updateHelicopterCombatRetreat } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_retreat";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("updateHelicopterCombatRetreat", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const manager: HelicopterCombatManager = new HelicopterCombatManager(object);

    manager.enemyLastSeenPos = MockVector.mock(1, 0, 0.5);
    manager.maxVelocity = 1000;
    manager.safeAltitude = 500;

    expect(manager.isRetreatInitialized).toBe(false);

    updateHelicopterCombatRetreat(manager);

    expect(manager.isRetreatInitialized).toBe(true);
    expect(manager.helicopter.SetMaxVelocity).toHaveBeenCalledWith(1000);
    expect(manager.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(1000);
    expect(manager.helicopter.LookAtPoint).toHaveBeenCalledWith(ZERO_VECTOR, false);
    expect(manager.helicopter.SetDestPosition).toHaveBeenCalledWith(
      MockVector.create(3536.2838970939033, 500, 3536.2838970939033)
    );
    expect(manager.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
  });
});
