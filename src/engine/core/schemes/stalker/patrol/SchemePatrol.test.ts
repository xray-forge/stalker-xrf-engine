import { beforeEach, describe, expect, it } from "@jest/globals";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { EvaluatorSectionEnded } from "@/engine/core/ai/planner/evaluators";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject, registerSimulator } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ActionPatrolCommander, ActionPatrolFollower } from "@/engine/core/schemes/stalker/patrol/actions";
import { EvaluatorPatrolCommander } from "@/engine/core/schemes/stalker/patrol/evaluators";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol/patrol_types";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import { SchemePatrol } from "@/engine/core/schemes/stalker/patrol/SchemePatrol";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, ServerHumanObject } from "@/engine/lib/types";
import {
  assertSchemeSubscribedToManager,
  checkPlannerAction,
  mockSchemeState,
  MockSquad,
  resetRegistry,
} from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemePatrol class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    patrolConfig.PATROLS = new LuaTable();
  });

  it("should be correctly defined", () => {
    expect(SchemePatrol.SCHEME_SECTION).toBe("patrol");
    expect(SchemePatrol.SCHEME_SECTION).toBe(EScheme.PATROL);
    expect(SchemePatrol.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should require main configuration fields and verify paths", () => {
    const squad: Squad = MockSquad.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });

    serverObject.group_id = squad.id;

    registerObject(object);
    loadSchemeImplementation(SchemePatrol);

    expect(() => {
      SchemePatrol.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "patrol@test": {},
        }),
        SchemePatrol.SCHEME_SECTION,
        `${SchemePatrol.SCHEME_SECTION}@test`,
        "smart_terrain_name"
      );
    }).toThrow("Attempt to read a non-existent string field 'path_walk' in section 'patrol@test'.");

    expect(() => {
      SchemePatrol.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "patrol@test": {
            path_walk: "test-wp",
            path_look: "test-wp",
          },
        }),
        SchemePatrol.SCHEME_SECTION,
        `${SchemePatrol.SCHEME_SECTION}@test`,
        "smart_terrain_name"
      );
    }).toThrow(
      `Bad attempt to set 'path_look' equal to 'path_walk' in section 'patrol@test' for object '${object.name()}'.`
    );
  });

  it("should be activate with default values", () => {
    const squad: Squad = MockSquad.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "patrol@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@2",
        path_walk: "test-wp",
      },
    });

    serverObject.group_id = squad.id;

    registerObject(object);
    loadSchemeImplementation(SchemePatrol);

    const state: ISchemePatrolState = SchemePatrol.activate(
      object,
      ini,
      SchemePatrol.SCHEME_SECTION,
      `${SchemePatrol.SCHEME_SECTION}@test`,
      "smart_terrain_name"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("patrol");
    expect(state.section).toBe("patrol@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "patrol@test"));
    expect(state.actions?.length()).toBe(2);

    expect(state.pathName).toBe("smart_terrain_name_test-wp");
    expect(state.pathWalk).toBe("smart_terrain_name_test-wp");
    expect(state.pathLook).toBeNull();
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();
    expect(state.formation).toBe("back");
    expect(state.silent).toBe(false);
    expect(state.moveType).toBe("patrol");
    expect(state.commander).toBe(false);
    expect(state.patrolKey).toBe(`smart_terrain_name_test-wp_${squad.id}`);
    expect(state.suggestedState).toEqual({
      campering: null,
      camperingFire: null,
      moving: null,
      movingFire: null,
      standing: null,
    });

    expect(state.patrolManager).toBeInstanceOf(PatrolManager);
    expect(state.patrolManager).toBe(patrolConfig.PATROLS.get(state.patrolKey));
    expect(state.patrolManager.name).toBe(state.pathName);

    expect(patrolConfig.PATROLS.length()).toBe(1);
    expect(patrolConfig.PATROLS.get(state.patrolKey)).toBeInstanceOf(PatrolManager);

    assertSchemeSubscribedToManager(state, ActionPatrolCommander);
    assertSchemeSubscribedToManager(state, ActionPatrolFollower);
  });

  it("should be activate with custom values", () => {
    const squad: Squad = MockSquad.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "patrol@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@2",
        path_walk: "test-wp",
        path_look: "test-wp-1",
        formation: "line",
        silent: "true",
        move_type: "move-type",
        commander: "true",
        def_state_moving: "test_def_state_moving",
        def_state_moving1: "test_def_state_moving1",
        def_state_standing: "test_def_state_standing",
      },
    });

    serverObject.group_id = squad.id;

    registerObject(object);
    loadSchemeImplementation(SchemePatrol);

    const state: ISchemePatrolState = SchemePatrol.activate(
      object,
      ini,
      SchemePatrol.SCHEME_SECTION,
      `${SchemePatrol.SCHEME_SECTION}@test`,
      "smart_terrain_name"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("patrol");
    expect(state.section).toBe("patrol@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "patrol@test"));
    expect(state.actions?.length()).toBe(2);

    expect(state.pathName).toBe("smart_terrain_name_test-wp");
    expect(state.pathWalk).toBe("smart_terrain_name_test-wp");
    expect(state.pathLook).toBe("smart_terrain_name_test-wp-1");
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();
    expect(state.formation).toBe("line");
    expect(state.silent).toBe(true);
    expect(state.moveType).toBe("move-type");
    expect(state.commander).toBe(true);
    expect(state.patrolKey).toBe(`smart_terrain_name_test-wp_${squad.id}`);
    expect(state.suggestedState).toEqual({
      campering: null,
      camperingFire: null,
      moving: "test_def_state_moving",
      movingFire: null,
      standing: "test_def_state_standing",
    });

    expect(patrolConfig.PATROLS.length()).toBe(1);
    expect(patrolConfig.PATROLS.get(state.patrolKey)).toBeInstanceOf(PatrolManager);

    assertSchemeSubscribedToManager(state, ActionPatrolCommander);
    assertSchemeSubscribedToManager(state, ActionPatrolFollower);
  });

  it("should handle add actions", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const state: ISchemePatrolState = mockSchemeState(EScheme.PATROL);

    objectState.patrolManager = new StalkerPatrolManager(object);

    SchemePatrol.add(object, MockIniFile.mock("test.ltx", {}), EScheme.PATROL, "patrol@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.add_evaluator).toHaveBeenCalledTimes(2);
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.IS_PATROL_ENDED, expect.any(EvaluatorSectionEnded));
    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_PATROL_COMMANDER,
      expect.any(EvaluatorPatrolCommander)
    );

    checkPlannerAction(
      planner.action(EActionId.COMMAND_SQUAD),
      ActionPatrolCommander,
      [
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_PATROL_ENDED, false],
        [EEvaluatorId.IS_PATROL_COMMANDER, true],
      ],
      [
        [EEvaluatorId.IS_PATROL_ENDED, true],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(
      planner.action(EActionId.PATROL_ACTIVITY),
      ActionPatrolFollower,
      [
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_PATROL_ENDED, false],
        [EEvaluatorId.IS_PATROL_COMMANDER, false],
      ],
      [
        [EEvaluatorId.IS_PATROL_ENDED, true],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_PATROL_ENDED, true]], []);

    assertSchemeSubscribedToManager(state, ActionPatrolCommander);
    assertSchemeSubscribedToManager(state, ActionPatrolFollower);
  });
});
