import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import { updateHelicopterCombatRetreat } from "@/engine/core/schemes/helicopter/heli_move/combat/helicopter_combat_retreat";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

describe("updateHelicopterCombatRetreat", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mockHelicopter();
    const controller: HelicopterCombatController = new HelicopterCombatController(object);

    controller.enemyLastSeenPos = MockVector.mock(1, 0, 0.5);
    controller.maxVelocity = 1000;
    controller.safeAltitude = 500;

    expect(controller.isRetreatInitialized).toBe(false);

    updateHelicopterCombatRetreat(controller);

    expect(controller.isRetreatInitialized).toBe(true);
    expect(controller.helicopter.SetMaxVelocity).toHaveBeenCalledWith(1000);
    expect(controller.helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(1000);
    expect(controller.helicopter.LookAtPoint).toHaveBeenCalledWith(ZERO_VECTOR, false);
    expect(controller.helicopter.SetDestPosition).toHaveBeenCalledWith(
      MockVector.create(3536.2838970939033, 500, 3536.2838970939033)
    );
    expect(controller.helicopter.ClearEnemy).toHaveBeenCalledTimes(1);
  });
});
