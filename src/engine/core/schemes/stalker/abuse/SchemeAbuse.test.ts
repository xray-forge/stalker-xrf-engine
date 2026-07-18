import { describe, expect, it } from "@jest/globals";
import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/stalker/abuse/actions";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators";
import { SchemeAbuse } from "@/engine/core/schemes/stalker/abuse/SchemeAbuse";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { assertSchemeNotToBeSubscribed, checkPlannerAction } from "@/fixtures/engine";

describe("SchemeAbuse", () => {
  it("should be correctly defined", () => {
    expect(SchemeAbuse.SCHEME_SECTION).toBe("abuse");
    expect(SchemeAbuse.SCHEME_SECTION).toBe(EScheme.ABUSE);
    expect(SchemeAbuse.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "abuse@test": {
        on_info: "{+test} first, second",
      },
    });

    loadSchemeImplementation(SchemeAbuse);
    registerObject(object);

    const state: ISchemeAbuseState = SchemeAbuse.activate(object, ini, EScheme.ABUSE, "abuse@test");

    expect(state.logic).toBeUndefined();

    assertSchemeNotToBeSubscribed(state);
  });

  it("should correctly add planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "abuse@test": {},
    });

    loadSchemeImplementation(SchemeAbuse);
    registerObject(object);

    const state: ISchemeAbuseState = SchemeAbuse.activate(object, ini, EScheme.ABUSE, "abuse@test");
    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.IS_ABUSED)).toBeInstanceOf(EvaluatorAbuse);
    expect(state.abuseManager).toBeInstanceOf(AbuseManager);

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_ABUSED, false]], []);
    checkPlannerAction(
      planner.action(EActionId.ABUSE),
      ActionAbuseHit,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, true],
      ],
      [[EEvaluatorId.IS_ABUSED, false]]
    );
  });
});
