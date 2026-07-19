import { describe, it } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { setupStalkerWeaponStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/weapon_planner";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import {
  ActionWeaponDrop,
  ActionWeaponNone,
  ActionWeaponStrap,
  ActionWeaponUnstrap,
} from "@/engine/core/ai/state/weapon";
import { checkPlannerAction } from "@/fixtures/engine";

describe("weapon_planner util", () => {
  it("should correctly setup state planner planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerWeaponStatePlanner(planner, controller);

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
