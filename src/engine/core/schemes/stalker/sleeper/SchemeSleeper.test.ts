import { describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { registerObject } from "@/engine/core/database";
import { ActionSleeperActivity } from "@/engine/core/schemes/stalker/sleeper/actions";
import { SchemeSleeper } from "@/engine/core/schemes/stalker/sleeper/SchemeSleeper";
import { ISchemeSleeperState } from "@/engine/core/schemes/stalker/sleeper/sleeper_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction } from "@/fixtures/engine";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeSleeper", () => {
  it("should correctly activate with default data", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sleeper@test": {
        path_main: "zat_b40_merc_01_walk",
      },
    });

    loadSchemeImplementation(SchemeSleeper);
    registerObject(object);

    const state: ISchemeSleeperState = SchemeSleeper.activate(
      object,
      ini,
      EScheme.SLEEPER,
      "sleeper@test",
      "zat_b40_smart_terrain"
    );

    expect(state.logic).toEqualLuaTables({});
    expect(state.pathMain).toBe("zat_b40_smart_terrain_zat_b40_merc_01_walk");
    expect(state.wakeable).toBe(false);
    expect(state.pathWalk).toBeNull();
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLook).toBeNull();
    expect(state.pathLookInfo).toBeNull();

    assertSchemeSubscribedToManager(state, ActionSleeperActivity);
  });

  it("should correctly activate with custom data", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sleeper@test": {
        on_info: "{+test} first, second",
        path_main: "zat_b40_merc_01_walk",
        wakeable: true,
      },
    });

    loadSchemeImplementation(SchemeSleeper);
    registerObject(object);

    const state: ISchemeSleeperState = SchemeSleeper.activate(
      object,
      ini,
      EScheme.SLEEPER,
      "sleeper@test",
      "zat_b40_smart_terrain"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sleeper@test"));
    expect(state.pathMain).toBe("zat_b40_smart_terrain_zat_b40_merc_01_walk");
    expect(state.wakeable).toBe(true);
    expect(state.pathWalk).toBeNull();
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLook).toBeNull();
    expect(state.pathLookInfo).toBeNull();

    assertSchemeSubscribedToManager(state, ActionSleeperActivity);
  });

  it("should correctly activate with custom data", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sleeper@test": {
        on_info: "{+test} first, second",
        path_main: "zat_b40_merc_01_walk",
        wakeable: true,
      },
    });

    loadSchemeImplementation(SchemeSleeper);
    registerObject(object);

    SchemeSleeper.activate(object, ini, EScheme.SLEEPER, "sleeper@test", "zat_b40_smart_terrain");

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.NEED_SLEEPER)).toBeInstanceOf(EvaluatorSectionActive);

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.NEED_SLEEPER, false]], []);
    checkPlannerAction(
      planner.action(EActionId.SLEEP_ACTIVITY),
      ActionSleeperActivity,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.NEED_SLEEPER, true],
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
      ],
      [
        [EEvaluatorId.NEED_SLEEPER, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );
  });
});
