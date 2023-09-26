import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/stalker/abuse/actions";
import { EvaluatorAbuse } from "@/engine/core/schemes/stalker/abuse/evaluators";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/ISchemeAbuseState";
import { SchemeAbuse } from "@/engine/core/schemes/stalker/abuse/SchemeAbuse";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeNotToBeSubscribed, checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeAbuse class", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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
