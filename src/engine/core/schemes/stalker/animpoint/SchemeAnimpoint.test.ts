import { beforeEach, describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ActionPlayAnimpoint, ActionReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/actions";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { EvaluatorReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/evaluators";
import { SchemeAnimpoint } from "@/engine/core/schemes/stalker/animpoint/SchemeAnimpoint";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeAnimpoint class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeAnimpoint.SCHEME_SECTION).toBe("animpoint");
    expect(SchemeAnimpoint.SCHEME_SECTION).toBe(EScheme.ANIMPOINT);
    expect(SchemeAnimpoint.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "animpoint@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@2",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeAnimpoint);

    const state: ISchemeAnimpointState = SchemeAnimpoint.activate(
      object,
      ini,
      SchemeAnimpoint.SCHEME_SECTION,
      `${SchemeAnimpoint.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("animpoint");
    expect(state.section).toBe("animpoint@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "animpoint@test"));
    expect(state.actions?.length()).toBe(2);

    expect(state.coverName).toBe("$script_id$_cover");
    expect(state.useCamp).toBe(true);
    expect(state.reachMovement).toBe(EStalkerState.WALK);
    expect(state.reachDistanceSqr).toBe(0.5625);
    expect(state.availableAnimations).toBeNull();

    assertSchemeSubscribedToManager(state, ActionPlayAnimpoint);
    assertSchemeSubscribedToManager(state, AnimpointManager);
  });

  it("should correctly activate with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "animpoint@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} another@2",
        cover_name: "test-cover",
        use_camp: false,
        reach_movement: "sprint",
        reach_distance: 3,
        avail_animations: "a, b, c",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeAnimpoint);

    const state: ISchemeAnimpointState = SchemeAnimpoint.activate(
      object,
      ini,
      SchemeAnimpoint.SCHEME_SECTION,
      `${SchemeAnimpoint.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("animpoint");
    expect(state.section).toBe("animpoint@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "animpoint@test"));
    expect(state.actions?.length()).toBe(2);

    expect(state.coverName).toBe("test-cover");
    expect(state.useCamp).toBe(false);
    expect(state.reachMovement).toBe(EStalkerState.SPRINT);
    expect(state.reachDistanceSqr).toBe(9);
    expect(state.availableAnimations).toEqualLuaArrays(["a", "b", "c"]);

    assertSchemeSubscribedToManager(state, ActionPlayAnimpoint);
    assertSchemeSubscribedToManager(state, AnimpointManager);
  });

  it("should handle add actions", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const state: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);

    SchemeAnimpoint.add(object, MockIniFile.mock("test.ltx", {}), EScheme.ANIMPOINT, "patrol@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.add_evaluator).toHaveBeenCalledTimes(2);
    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_ANIMPOINT_REACHED,
      expect.any(EvaluatorReachAnimpoint)
    );
    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_ANIMPOINT_NEEDED,
      expect.any(EvaluatorSectionActive)
    );

    checkPlannerAction(
      planner.action(EActionId.ANIMPOINT_REACH),
      ActionReachAnimpoint,
      [
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_ANIMPOINT_NEEDED, true],
        [EEvaluatorId.IS_ANIMPOINT_REACHED, false],
      ],
      [
        [EEvaluatorId.IS_ANIMPOINT_NEEDED, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(
      planner.action(EActionId.ANIMPOINT_PLAY),
      ActionPlayAnimpoint,
      [
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.IS_ANIMPOINT_NEEDED, true],
        [EEvaluatorId.IS_ANIMPOINT_REACHED, true],
      ],
      [
        [EEvaluatorId.IS_ANIMPOINT_NEEDED, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_ANIMPOINT_NEEDED, false]], []);

    assertSchemeSubscribedToManager(state, AnimpointManager);
    assertSchemeSubscribedToManager(state, ActionPlayAnimpoint);
  });
});
