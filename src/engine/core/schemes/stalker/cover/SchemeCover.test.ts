import { beforeEach, describe, expect, it } from "@jest/globals";
import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/ini";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { ActionCover } from "@/engine/core/schemes/stalker/cover/actions";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover/cover_types";
import { SchemeCover } from "@/engine/core/schemes/stalker/cover/SchemeCover";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToManager, checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("SchemeCover", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemeCover);
  });

  it("should be correctly defined", () => {
    expect(SchemeCover.SCHEME_SECTION).toBe("cover");
    expect(SchemeCover.SCHEME_SECTION).toBe(EScheme.COVER);
    expect(SchemeCover.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "cover@test": { smart: "test_smart" } });

    registerObject(object);

    const state: ISchemeCoverState = SchemeCover.activate(object, ini, EScheme.COVER, "cover@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.smartTerrainName).toBe("test_smart");
    expect(state.animationConditionList).toEqualLuaTables(parseConditionsList("hide"));
    expect(state.soundIdle).toBeNull();
    expect(state.useAttackDirection).toBe(true);
    expect(state.radiusMin).toBe(3);
    expect(state.radiusMax).toBe(5);
  });

  it("should correctly activate with data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "cover@test": {
        on_info: "{+test} first, second",
        smart: "another_smart",
        anim: "threat_na",
        sound_idle: "state",
        use_attack_direction: false,
        radius_min: 10,
        radius_max: 20,
      },
    });

    registerObject(object);

    const state: ISchemeCoverState = SchemeCover.activate(object, ini, EScheme.COVER, "cover@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "cover@test"));
    expect(state.smartTerrainName).toBe("another_smart");
    expect(state.animationConditionList).toEqualLuaTables(parseConditionsList("threat_na"));
    expect(state.soundIdle).toBe("state");
    expect(state.useAttackDirection).toBe(false);
    expect(state.radiusMin).toBe(10);
    expect(state.radiusMax).toBe(20);
  });

  it("should fail activation without smart terrain", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "cover@test": {} });

    registerObject(object);

    expect(() => SchemeCover.activate(object, ini, EScheme.COVER, "cover@test")).toThrow(
      "There is no path_walk and smart in ActionCover."
    );
  });

  it("should correctly add action to planner", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "cover@test": { smart: "test_smart" } });
    const state: ISchemeCoverState = mockSchemeState(EScheme.COVER);

    registerObject(object);

    SchemeCover.add(object, ini, EScheme.COVER, "cover@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.add_evaluator).toHaveBeenCalledTimes(1);
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.NEED_COVER, expect.any(EvaluatorSectionActive));

    checkPlannerAction(
      planner.action(EActionId.COVER_ACTIVITY),
      ActionCover,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.NEED_COVER, true],
      ],
      [
        [EEvaluatorId.NEED_COVER, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.NEED_COVER, false]], []);

    assertSchemeSubscribedToManager(state, ActionCover);
  });
});
