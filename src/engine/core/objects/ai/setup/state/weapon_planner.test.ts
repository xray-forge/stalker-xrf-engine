import { describe, it } from "@jest/globals";

import { setupStalkerWeaponStatePlanner } from "@/engine/core/objects/ai/setup/state/weapon_planner";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import {
  ActionWeaponDrop,
  ActionWeaponNone,
  ActionWeaponStrap,
  ActionWeaponUnstrap,
} from "@/engine/core/objects/state/weapon";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("weapon_planner util", () => {
  it("should correctly setup state planner planner actions", () => {
    const object: ClientObject = mockClientGameObject();
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
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_UNSTRAPPED, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_STRAPP),
      ActionWeaponStrap,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_STRAPPED, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_NONE),
      ActionWeaponNone,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_NONE, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.WEAPON_DROP),
      ActionWeaponDrop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_DROP, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );
  });
});
