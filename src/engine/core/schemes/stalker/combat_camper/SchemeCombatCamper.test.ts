import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockActionPlanner, MockGameObject, MockIniFile } from "xray16/mocks";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { ActionLookAround, ActionShoot } from "@/engine/core/schemes/stalker/combat_camper/actions";
import {
  EvaluatorCombatCamper,
  EvaluatorSeeBestEnemyEnemy,
} from "@/engine/core/schemes/stalker/combat_camper/evaluator";
import { SchemeCombatCamper } from "@/engine/core/schemes/stalker/combat_camper/SchemeCombatCamper";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToManager, checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("SchemeCombatCamper", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeCombatCamper.SCHEME_SECTION).toBe("combat_camper");
    expect(SchemeCombatCamper.SCHEME_SECTION).toBe(EScheme.COMBAT_CAMPER);
    expect(SchemeCombatCamper.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should fail without provided planner", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);

    registerObject(object);

    expect(() => SchemeCombatCamper.add(object, ini, EScheme.COMBAT, "combat@test", state)).toThrow(
      "Expected planner to be provided for add method call."
    );
  });

  it("should correctly add camper actions to the planner", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const planner: MockActionPlanner = new MockActionPlanner();

    registerObject(object);

    SchemeCombatCamper.add(object, ini, EScheme.COMBAT, "combat@test", state, planner.asMock());

    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_COMBAT_CAMPING_ENABLED,
      expect.any(EvaluatorCombatCamper)
    );
    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.SEE_BEST_ENEMY,
      expect.any(EvaluatorSeeBestEnemyEnemy)
    );

    checkPlannerAction(
      planner.action(EActionId.SHOOT),
      ActionShoot,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ENEMY, true],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_SCRIPTED_COMBAT, true],
        [EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, true],
        [EEvaluatorId.SEE_BEST_ENEMY, true],
      ],
      [
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(
      planner.action(EActionId.LOOK_AROUND),
      ActionLookAround,
      [
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_SCRIPTED_COMBAT, true],
        [EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, true],
        [EEvaluatorId.SEE_BEST_ENEMY, false],
      ],
      [
        [EEvaluatorId.SEE_BEST_ENEMY, true],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    expect(state.isCamperCombatAction).toBe(false);

    assertSchemeSubscribedToManager(state, ActionLookAround);
  });
});
