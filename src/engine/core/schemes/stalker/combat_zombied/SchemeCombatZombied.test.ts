import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockActionPlanner, MockGameObject, MockIniFile } from "xray16/mocks";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { ActionZombieGoToDanger, ActionZombieShoot } from "@/engine/core/schemes/stalker/combat_zombied/actions";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/evaluators";
import { SchemeCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/SchemeCombatZombied";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import {
  assertSchemeSubscribedToController,
  checkPlannerAction,
  mockSchemeState,
  resetRegistry,
} from "@/fixtures/engine";

describe("SchemeCombatZombied", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeCombatZombied.SCHEME_SECTION).toBe("combat_zombied");
    expect(SchemeCombatZombied.SCHEME_SECTION).toBe(EScheme.COMBAT_ZOMBIED);
    expect(SchemeCombatZombied.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should fail without provided planner", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);

    registerObject(object);

    expect(() => SchemeCombatZombied.add(object, ini, EScheme.COMBAT, "combat@test", state)).toThrow(
      "Expected planner to be provided for add method call."
    );
  });

  it("should correctly add zombied actions to the planner", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const planner: MockActionPlanner = new MockActionPlanner();

    registerObject(object);

    SchemeCombatZombied.add(object, ini, EScheme.COMBAT, "combat@test", state, planner.asMock());

    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED,
      expect.any(EvaluatorCombatZombied)
    );

    checkPlannerAction(
      planner.action(EActionId.ZOMBIED_SHOOT),
      ActionZombieShoot,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true],
        [EEvaluatorId.IS_SCRIPTED_COMBAT, true],
      ],
      [
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(
      planner.action(EActionId.ZOMBIED_GO_TO_DANGER),
      ActionZombieGoToDanger,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, true],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.DANGER, true],
      ],
      [
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    assertSchemeSubscribedToController(state, ActionZombieShoot);
    assertSchemeSubscribedToController(state, ActionZombieGoToDanger);
  });
});
