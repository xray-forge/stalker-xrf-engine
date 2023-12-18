import { describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { ActionRemarkActivity } from "@/engine/core/schemes/stalker/remark/actions";
import { ISchemeRemarkState } from "@/engine/core/schemes/stalker/remark/remark_types";
import { SchemeRemark } from "@/engine/core/schemes/stalker/remark/SchemeRemark";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeRemark", () => {
  it("should correctly activate with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ramark@test": {},
    });

    loadSchemeImplementation(SchemeRemark);
    registerObject(object);

    const state: ISchemeRemarkState = SchemeRemark.activate(object, ini, EScheme.REMARK, "ramark@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.sndAnimSync).toBe(false);
    expect(state.snd).toBeNull();
    expect(state.anim).toEqualLuaTables(parseConditionsList("wait"));
    expect(state.tipsId).toBeNull();
    expect(state.sender).toBeUndefined();
    expect(state.target).toBe("nil");
    expect(state.targetId).toBeNull();
    expect(state.targetPosition).toBeNull();

    assertSchemeSubscribedToManager(state, ActionRemarkActivity);
  });

  it("should correctly activate with custom data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ramark@test": {
        on_info: "{+test} first, second",
        snd_anim_sync: true,
        snd: "test_snd",
        anim: "test",
        tips: "test_tip",
        tips_sender: "test_sender",
        target: "test_target",
      },
    });

    loadSchemeImplementation(SchemeRemark);
    registerObject(object);

    const state: ISchemeRemarkState = SchemeRemark.activate(object, ini, EScheme.REMARK, "ramark@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ramark@test"));
    expect(state.sndAnimSync).toBe(true);
    expect(state.snd).toBe("test_snd");
    expect(state.anim).toEqualLuaTables(parseConditionsList("test"));
    expect(state.tipsId).toBe("test_tip");
    expect(state.sender).toBe("test_sender");
    expect(state.target).toBe("test_target");
    expect(state.targetId).toBeNull();
    expect(state.targetPosition).toBeNull();

    assertSchemeSubscribedToManager(state, ActionRemarkActivity);
  });

  it("should correctly add planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ramark@test": {
        on_info: "{+test} first, second",
        snd_anim_sync: true,
        snd: "test_snd",
        anim: "test",
        tips: "test_tip",
        tips_sender: "test_sender",
        target: "test_target",
      },
    });

    loadSchemeImplementation(SchemeRemark);
    registerObject(object);

    SchemeRemark.activate(object, ini, EScheme.REMARK, "ramark@test");

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.NEED_REMARK)).toBeInstanceOf(EvaluatorSectionActive);

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.NEED_REMARK, false]], []);

    checkPlannerAction(
      planner.action(EActionId.REMARK_ACTIVITY),
      ActionRemarkActivity,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.NEED_REMARK, true],
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
      ],
      [
        [EEvaluatorId.NEED_REMARK, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );
  });
});
