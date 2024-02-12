import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cast_planner } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ActionPostCombatIdleWait } from "@/engine/core/schemes/stalker/combat_idle/actions";
import { EvaluatorHasEnemy } from "@/engine/core/schemes/stalker/combat_idle/evaluators";
import { SchemePostCombatIdle } from "@/engine/core/schemes/stalker/combat_idle/SchemePostCombatIdle";
import { ActionPlanner, EScheme, ESchemeType, GameObject } from "@/engine/lib/types";
import { checkPlannerAction, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("SchemePostCombatIdle", () => {
  beforeEach(() => {
    resetRegistry();
    jest.spyOn(Date, "now").mockImplementation(() => 5_000);
  });

  it("should be correctly defined", () => {
    expect(SchemePostCombatIdle.SCHEME_SECTION).toBe("post_combat_idle");
    expect(SchemePostCombatIdle.SCHEME_SECTION).toBe(EScheme.POST_COMBAT_IDLE);
    expect(SchemePostCombatIdle.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should be ignore for zombies", () => {
    const object: GameObject = MockGameObject.mockStalker({ community: "zombied" });

    SchemePostCombatIdle.setup(object);

    expect(object.motivation_action_manager).toHaveBeenCalledTimes(0);
    expect(object.motivation_action_manager().remove_action).toHaveBeenCalledTimes(0);
    expect(object.motivation_action_manager().remove_evaluator).toHaveBeenCalledTimes(0);
  });

  it("should correctly setup", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    SchemePostCombatIdle.setup(object);

    expect(state[EScheme.POST_COMBAT_IDLE]).toEqual({
      timer: 5_000,
      animation: null,
      lastBestEnemyId: null,
      lastBestEnemyName: null,
    });

    const planner: ActionPlanner = object.motivation_action_manager();
    const combatPlanner: ActionPlanner = cast_planner(planner.action(EActionId.COMBAT));

    expect(planner.remove_evaluator).toHaveBeenCalledWith(EEvaluatorId.ENEMY);
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.ENEMY, expect.any(EvaluatorHasEnemy));

    expect(combatPlanner.remove_evaluator).toHaveBeenCalledWith(EEvaluatorId.ENEMY);
    expect(combatPlanner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.ENEMY, expect.any(EvaluatorHasEnemy));

    expect(combatPlanner.remove_action).toHaveBeenCalledWith(EActionId.POST_COMBAT_WAIT);
    expect(combatPlanner.add_action).toHaveBeenCalledWith(
      EActionId.POST_COMBAT_WAIT,
      expect.any(ActionPostCombatIdleWait)
    );

    checkPlannerAction(
      combatPlanner.action(EActionId.POST_COMBAT_WAIT),
      ActionPostCombatIdleWait,
      [
        [EEvaluatorId.ENEMY, true],
        [EEvaluatorId.PURE_ENEMY, false],
        [EEvaluatorId.CRITICALLY_WOUNDED, false],
        [EEvaluatorId.DANGER_GRENADE, false],
      ],
      [[EEvaluatorId.ENEMY, false]]
    );
  });
});
