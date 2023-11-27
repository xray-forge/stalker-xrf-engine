import { describe, it } from "@jest/globals";

import { setupStalkerWeaponStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/weapon_planner";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import {
  ActionWeaponDrop,
  ActionWeaponNone,
  ActionWeaponStrap,
  ActionWeaponUnstrap,
} from "@/engine/core/ai/state/weapon";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("weapon_planner util", () => {
  it("should correctly setup state planner planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerWeaponStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_UNSTRAPP),
      ActionWeaponUnstrap,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.WEAPON_UNSTRAPPED_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_STRAPP),
      ActionWeaponStrap,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.WEAPON_STRAPPED_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_NONE),
      ActionWeaponNone,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.WEAPON_NONE_TARGET, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_DROP),
      ActionWeaponDrop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.WEAPON_DROP_TARGET, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON_SET, true]]
    );
  });
});
