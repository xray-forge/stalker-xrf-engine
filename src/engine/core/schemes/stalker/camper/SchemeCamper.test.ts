import { describe, expect, it } from "@jest/globals";

import { EvaluatorSectionEnded } from "@/engine/core/ai/planner/evaluators";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { ActionCloseCombat } from "@/engine/core/schemes/stalker/camper/actions";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { EvaluatorCloseCombat } from "@/engine/core/schemes/stalker/camper/evaluators";
import { SchemeCamper } from "@/engine/core/schemes/stalker/camper/SchemeCamper";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction } from "@/fixtures/engine";
import { MockActionBase, MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeCamper", () => {
  it("should fail if look and walk patrols are same", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "camper@test": {
        path_walk: "test-wp",
        path_look: "test-wp",
      },
    });

    object.motivation_action_manager().add_action(EActionId.SEARCH_CORPSE, MockActionBase.mock(object));
    object.motivation_action_manager().add_action(EActionId.HELP_WOUNDED, MockActionBase.mock(object));

    registerObject(object);
    loadSchemeImplementation(SchemeCamper);

    expect(() => SchemeCamper.activate(object, ini, EScheme.CAMPER, "camper@test", "test_smart")).toThrow(
      `You are trying to set 'path_look' equal to 'path_walk' in section 'camper@test' for object '${object.name()}'.`
    );
  });

  it("should fail if sniper and no-retreat are set", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "camper@test": {
        path_walk: "test-wp",
        path_look: "test-wp-2",
        sniper: true,
        no_retreat: true,
      },
    });

    object.motivation_action_manager().add_action(EActionId.SEARCH_CORPSE, MockActionBase.mock(object));
    object.motivation_action_manager().add_action(EActionId.HELP_WOUNDED, MockActionBase.mock(object));

    registerObject(object);
    loadSchemeImplementation(SchemeCamper);

    expect(() => SchemeCamper.activate(object, ini, EScheme.CAMPER, "camper@test", "test_smart")).toThrow(
      `Error: object '${object.name()}', section 'camper@test'. No_retreat not available for sniper.`
    );
  });

  it("should correctly activate scheme with default values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "camper@test": {
        on_info: "{+test_info} a, b",
        path_walk: "test-wp",
        path_look: "test-wp-2",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCamper);

    object.motivation_action_manager().add_action(EActionId.SEARCH_CORPSE, MockActionBase.mock(object));
    object.motivation_action_manager().add_action(EActionId.HELP_WOUNDED, MockActionBase.mock(object));

    const state: ISchemeCamperState = SchemeCamper.activate(object, ini, EScheme.CAMPER, "camper@test", "test_smart");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "camper@test"));
    expect(state.pathWalk).toBe("test_smart_test-wp");
    expect(state.pathLook).toBe("test_smart_test-wp-2");
    expect(state.sniper).toBe(false);
    expect(state.noRetreat).toBe(false);
    expect(state.shoot).toBe("always");
    expect(state.sniperAnim).toBe("hide_na");
    expect(state.radius).toBe(20);
    expect(state.suggestedState).toEqual({
      campering: null,
      camperingFire: null,
      moving: null,
      movingFire: null,
      standing: null,
    });
    expect(state.scantimeFree).toBe(60_000);
    expect(state.attackSound).toBe("fight_attack");
    expect(state.idle).toBe(60_000);
    expect(state.postEnemyWait).toBe(5000);
    expect(state.enemyDisp).toBe(0.1221732171873282);
    expect(state.scandelta).toBe(30);
    expect(state.timedelta).toBe(4000);
    expect(state.timeScanDelta).toBe(state.timedelta / state.scandelta);

    assertSchemeSubscribedToManager(state, ActionCloseCombat);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "camper@test": {
        on_info: "{+test_info} a, b",
        path_walk: "test-wp",
        path_look: "test-wp-2",
        sniper: true,
        no_retreat: false,
        shoot: "none",
        sniper_anim: "test_sniper_aim",
        radius: 325,
        def_state_moving: "def_state_moving",
        def_state_moving_fire: "def_state_moving_fire",
        def_state_campering: "def_state_campering",
        def_state_standing: "def_state_standing",
        def_state_campering_fire: "def_state_campering_fire",
        scantime_free: 434,
        attack_sound: "test_attack",
        enemy_idle: 231,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCamper);

    object.motivation_action_manager().add_action(EActionId.SEARCH_CORPSE, MockActionBase.mock(object));
    object.motivation_action_manager().add_action(EActionId.HELP_WOUNDED, MockActionBase.mock(object));

    const state: ISchemeCamperState = SchemeCamper.activate(object, ini, EScheme.CAMPER, "camper@test", "test_smart");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "camper@test"));
    expect(state.pathWalk).toBe("test_smart_test-wp");
    expect(state.pathLook).toBe("test_smart_test-wp-2");
    expect(state.sniper).toBe(true);
    expect(state.noRetreat).toBe(false);
    expect(state.shoot).toBe("none");
    expect(state.sniperAnim).toBe("test_sniper_aim");
    expect(state.radius).toBe(325);
    expect(state.suggestedState).toEqual({
      campering: "def_state_campering",
      camperingFire: "def_state_campering_fire",
      moving: "def_state_moving",
      movingFire: "def_state_moving_fire",
      standing: "def_state_standing",
    });
    expect(state.scantimeFree).toBe(434);
    expect(state.attackSound).toBe("test_attack");
    expect(state.idle).toBe(231);
    expect(state.postEnemyWait).toBe(5000);
    expect(state.enemyDisp).toBe(0.1221732171873282);
    expect(state.scandelta).toBe(30);
    expect(state.timedelta).toBe(4000);
    expect(state.timeScanDelta).toBe(state.timedelta / state.scandelta);

    assertSchemeSubscribedToManager(state, ActionCloseCombat);
  });

  it("should correctly add planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "camper@test": {
        on_info: "{+test_info} a, b",
        path_walk: "test-wp",
        path_look: "test-wp-2",
      },
    });

    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_action(EActionId.SEARCH_CORPSE, MockActionBase.mock(object));
    planner.add_action(EActionId.HELP_WOUNDED, MockActionBase.mock(object));

    loadSchemeImplementation(SchemeCamper);
    registerObject(object);

    SchemeCamper.activate(object, ini, EScheme.CAMPER, "camper@test", "test_smart");

    expect(planner.evaluator(EEvaluatorId.IS_CLOSE_COMBAT_ENDED)).toBeInstanceOf(EvaluatorSectionEnded);
    expect(planner.evaluator(EEvaluatorId.IS_CLOSE_COMBAT)).toBeInstanceOf(EvaluatorCloseCombat);

    checkPlannerAction(
      planner.action(EActionId.CLOSE_COMBAT),
      ActionCloseCombat,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.IS_CLOSE_COMBAT_ENDED, false],
        [EEvaluatorId.IS_CLOSE_COMBAT, false],
        [EEvaluatorId.CAN_FIGHT, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
      ],
      [
        [EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );
    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true]], []);
    checkPlannerAction(
      planner.action(EActionId.GATHER_ITEMS),
      "generic",
      [[EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true]],
      []
    );
    checkPlannerAction(
      planner.action(EActionId.SEARCH_CORPSE),
      "MockActionBase",
      [[EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true]],
      []
    );
    checkPlannerAction(
      planner.action(EActionId.HELP_WOUNDED),
      "MockActionBase",
      [[EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true]],
      []
    );

    checkPlannerAction(
      planner.action(EActionId.COMBAT),
      "generic",
      [[EEvaluatorId.IS_CLOSE_COMBAT, true]],
      [
        [EEvaluatorId.IS_CLOSE_COMBAT, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
        [EEvaluatorId.IS_CLOSE_COMBAT_ENDED, true],
      ]
    );
  });
});
