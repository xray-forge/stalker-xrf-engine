import { describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { registerObject } from "@/engine/core/database";
import { ActionSmartCoverActivity } from "@/engine/core/schemes/stalker/smartcover/actions";
import { EvaluatorUseSmartCoverInCombat } from "@/engine/core/schemes/stalker/smartcover/evaluators";
import { SchemeSmartCover } from "@/engine/core/schemes/stalker/smartcover/SchemeSmartCover";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover/smartcover_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeSmartCover", () => {
  it("should correctly activate with default data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "smartcover@test": {},
    });

    loadSchemeImplementation(SchemeSmartCover);
    registerObject(object);

    const state: ISchemeSmartCoverState = SchemeSmartCover.activate(object, ini, EScheme.SMARTCOVER, "smartcover@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.coverName).toBe("$script_id$_cover");
    expect(state.loopholeName).toBeNull();
    expect(state.coverState).toBe("default_behaviour");
    expect(state.targetEnemy).toBeNull();
    expect(state.targetPath).toBe("nil");
    expect(state.idleMinTime).toBe(6);
    expect(state.idleMaxTime).toBe(10);
    expect(state.lookoutMinTime).toBe(6);
    expect(state.lookoutMaxTime).toBe(10);
    expect(state.exitBodyState).toBe("stand");
    expect(state.usePrecalcCover).toBe(false);
    expect(state.useInCombat).toBe(false);
    expect(state.weaponType).toBeNull();
    expect(state.moving).toBe("sneak");
    expect(state.soundIdle).toBeNull();

    assertSchemeSubscribedToManager(state, ActionSmartCoverActivity);
  });

  it("should correctly activate with custom data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "smartcover@test": {
        on_info: "{+test} first, second",
        cover_name: "test_cover",
        loophole_name: "test_loophole",
        target_enemy: "test_enemy",
        target_path: "test_target_path",
        idle_min_time: 15,
        idle_max_time: 25,
        lookout_min_time: 15,
        lookout_max_time: 25,
        exit_body_state: "test_body_state",
        use_precalc_cover: true,
        use_in_combat: true,
        weapon_type: "test_type",
        def_state_moving: "test_moving",
        sound_idle: "test_sound",
      },
    });

    loadSchemeImplementation(SchemeSmartCover);
    registerObject(object);

    const state: ISchemeSmartCoverState = SchemeSmartCover.activate(object, ini, EScheme.SMARTCOVER, "smartcover@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "smartcover@test"));
    expect(state.coverName).toBe("test_cover");
    expect(state.loopholeName).toBe("test_loophole");
    expect(state.coverState).toBe("default_behaviour");
    expect(state.targetEnemy).toBe("test_enemy");
    expect(state.targetPath).toBe("test_target_path");
    expect(state.idleMinTime).toBe(15);
    expect(state.idleMaxTime).toBe(25);
    expect(state.lookoutMinTime).toBe(15);
    expect(state.lookoutMaxTime).toBe(25);
    expect(state.exitBodyState).toBe("test_body_state");
    expect(state.usePrecalcCover).toBe(true);
    expect(state.useInCombat).toBe(true);
    expect(state.weaponType).toBe("test_type");
    expect(state.moving).toBe("test_moving");
    expect(state.soundIdle).toBe("test_sound");

    assertSchemeSubscribedToManager(state, ActionSmartCoverActivity);
  });

  it("should correctly activate with default data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "smartcover@test": {},
    });

    loadSchemeImplementation(SchemeSmartCover);
    registerObject(object);

    const state: ISchemeSmartCoverState = SchemeSmartCover.activate(object, ini, EScheme.SMARTCOVER, "smartcover@test");

    assertSchemeSubscribedToManager(state, ActionSmartCoverActivity);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.IS_SMART_COVER_NEEDED)).toBeInstanceOf(EvaluatorSectionActive);
    expect(planner.evaluator(EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT)).toBeInstanceOf(
      EvaluatorUseSmartCoverInCombat
    );

    checkPlannerAction(
      planner.action(EActionId.SMART_COVER_ACTIVITY),
      ActionSmartCoverActivity,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_SMART_COVER_NEEDED, true],
        [EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
      ],
      [
        [EEvaluatorId.IS_SMART_COVER_NEEDED, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_SMART_COVER_NEEDED, false]], []);
    checkPlannerAction(
      planner.action(EActionId.COMBAT),
      "generic",
      [[EEvaluatorId.CAN_USE_SMART_COVER_IN_COMBAT, false]],
      []
    );
  });
});
