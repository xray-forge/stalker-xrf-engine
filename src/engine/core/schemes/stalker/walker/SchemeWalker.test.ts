import { describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { registerObject } from "@/engine/core/database";
import { ActionWalkerActivity } from "@/engine/core/schemes/stalker/walker/actions";
import { SchemeWalker } from "@/engine/core/schemes/stalker/walker/SchemeWalker";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker/walker_types";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction } from "@/fixtures/engine";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeWalker", () => {
  it("should correctly activate with default data", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "walker@test": {
        path_walk: "zat_b40_merc_01_walk",
      },
    });

    loadSchemeImplementation(SchemeWalker);
    registerObject(object);

    const state: ISchemeWalkerState = SchemeWalker.activate(
      object,
      ini,
      EScheme.WALKER,
      "walker@test",
      "zat_b40_smart_terrain"
    );

    expect(state.pathWalk).toBe("zat_b40_smart_terrain_zat_b40_merc_01_walk");
    expect(state.pathLook).toBeNull();
    expect(state.team).toBeNull();
    expect(state.soundIdle).toBeNull();
    expect(state.useCamp).toBe(false);
    expect(state.suggested_state).toEqualLuaTables({
      campering: null,
      camperingFire: null,
      moving: null,
      movingFire: null,
      standing: null,
    });
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();
    expect(state.description).toBe("walker_camp");
    expect(state.approvedActions).toEqualLuaTables({});

    assertSchemeSubscribedToManager(state, ActionWalkerActivity);
  });

  it("should correctly activate with custom data", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "walker@test": {
        path_walk: "zat_b40_merc_01_walk",
        path_look: "zat_b40_merc_01_look",
        team: "test_team",
        sound_idle: "test_sound",
        use_camp: true,
        def_state_standing: "idle",
        def_state_moving1: "idle_1",
      },
    });

    loadSchemeImplementation(SchemeWalker);
    registerObject(object);

    const state: ISchemeWalkerState = SchemeWalker.activate(
      object,
      ini,
      EScheme.WALKER,
      "walker@test",
      "zat_b40_smart_terrain"
    );

    expect(state.pathWalk).toBe("zat_b40_smart_terrain_zat_b40_merc_01_walk");
    expect(state.pathLook).toBe("zat_b40_smart_terrain_zat_b40_merc_01_look");
    expect(state.team).toBe("zat_b40_smart_terrain_test_team");
    expect(state.soundIdle).toBe("test_sound");
    expect(state.useCamp).toBe(true);
    expect(state.suggested_state).toEqualLuaTables({
      campering: null,
      camperingFire: null,
      moving: "idle_1",
      movingFire: null,
      standing: "idle",
    });
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();
    expect(state.description).toBe("walker_camp");
    expect(state.approvedActions).toEqualLuaTables({});

    assertSchemeSubscribedToManager(state, ActionWalkerActivity);
  });

  it("should correctly add evaluators/actions", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "walker@test": {
        path_walk: "zat_b40_merc_01_walk",
      },
    });

    loadSchemeImplementation(SchemeWalker);
    registerObject(object);

    SchemeWalker.activate(object, ini, EScheme.WALKER, "walker@test", "zat_b40_smart_terrain");

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.NEED_WALKER)).toBeInstanceOf(EvaluatorSectionActive);

    checkPlannerAction(
      planner.action(EActionId.WALKER_ACTIVITY),
      ActionWalkerActivity,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.NEED_WALKER, true],
        [EEvaluatorId.NEED_WALKER, true],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
      ],
      [
        [EEvaluatorId.NEED_WALKER, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.NEED_WALKER, false]], []);
  });
});
