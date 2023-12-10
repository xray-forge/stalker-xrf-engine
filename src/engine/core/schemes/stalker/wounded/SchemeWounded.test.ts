import { describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions";
import { EvaluatorCanFight, EvaluatorWounded } from "@/engine/core/schemes/stalker/wounded/evaluators";
import { SchemeWounded } from "@/engine/core/schemes/stalker/wounded/SchemeWounded";
import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { checkPlannerAction, mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeWounded class", () => {
  it("should correctly add to logics with default values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeWounded);

    const state: ISchemeWoundedState = SchemeWounded.activate(object, ini, EScheme.WOUNDED, "wounded@test");

    expect(state.woundManager).toBeInstanceOf(WoundManager);
    expect(state.isWoundedInitialized).toBeUndefined();
    expect(state.isTalkEnabled).toBeUndefined();
    expect(state.isNotForHelp).toBeUndefined();
    expect(state.woundedSection).toBeUndefined();
    expect(state.hpState).toBeUndefined();
    expect(state.hpStateSee).toBeUndefined();
    expect(state.hpVictim).toBeUndefined();
    expect(state.hpCover).toBeUndefined();
    expect(state.hpFight).toBeUndefined();
    expect(state.helpStartDialog).toBeUndefined();
    expect(state.psyState).toBeUndefined();
    expect(state.useMedkit).toBeUndefined();
    expect(state.helpDialog).toBeUndefined();
    expect(state.autoheal).toBeUndefined();

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.evaluator(EEvaluatorId.IS_WOUNDED)).toBeInstanceOf(EvaluatorWounded);
    expect(planner.evaluator(EEvaluatorId.CAN_FIGHT)).toBeInstanceOf(EvaluatorCanFight);

    checkPlannerAction(
      planner.action(EActionId.BECOME_WOUNDED),
      ActionWounded,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.IS_WOUNDED, true],
      ],
      [
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.CAN_FIGHT, true],
      ]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_WOUNDED, false]], []);
    checkPlannerAction(planner.action(EActionId.GATHER_ITEMS), "generic", [[EEvaluatorId.IS_WOUNDED, false]], []);
    checkPlannerAction(planner.action(EActionId.COMBAT), "generic", [[EEvaluatorId.CAN_FIGHT, true]], []);
    checkPlannerAction(planner.action(EActionId.DANGER), "generic", [[EEvaluatorId.CAN_FIGHT, true]], []);
    checkPlannerAction(planner.action(EActionId.ANOMALY), "generic", [[EEvaluatorId.CAN_FIGHT, true]], []);
  });

  it("should correctly reset", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "some@test": {
        wounded: "test_wounded",
      },
      logic: {
        wounded: "test_wounded_2",
      },
    });

    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      woundManager: { onHit: jest.fn() } as unknown as WoundManager,
    });

    state.ini = ini;
    state.sectionLogic = "logic";
    state[EScheme.WOUNDED] = schemeState;

    jest.spyOn(SchemeWounded, "initialize").mockImplementationOnce(() => {});

    SchemeWounded.reset(object, EScheme.WOUNDED, state, "some@test");

    expect(SchemeWounded.initialize).toHaveBeenCalledWith(object, state.ini, "test_wounded", schemeState);
    expect(schemeState.woundManager.onHit).toHaveBeenCalledTimes(1);

    jest.spyOn(SchemeWounded, "initialize").mockImplementationOnce(() => {});

    SchemeWounded.reset(object, EScheme.NIL, state, "some@test");
    expect(SchemeWounded.initialize).toHaveBeenCalledWith(object, state.ini, "test_wounded_2", schemeState);
    expect(schemeState.woundManager.onHit).toHaveBeenCalledTimes(2);
  });

  it("should correctly initialize with default values", () => {
    const object: GameObject = MockGameObject.mock({ idOverride: 100001 });
    const schemeIni: IniFile = mockIniFile("test2.ltx", {});
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {},
    });

    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, { ini: schemeIni });

    loadSchemeImplementation(SchemeWounded);
    SchemeWounded.initialize(object, ini, "wounded@test", schemeState);

    expect(schemeState).toEqualLuaTables({
      ini: schemeIni,
      autoheal: true,
      helpDialog: "dm_help_wounded_medkit_dialog",
      helpStartDialog: null,
      useMedkit: true,
      isNotForHelp: false,
      isTalkEnabled: true,
      isWoundedInitialized: true,
      logic: {},
      overrides: null,
      signals: null,
      woundedSection: "wounded@test",
      scheme: "wounded",
      section: "wounded@test",
      psyState: parseWoundedData(
        "20|{=best_pistol}psy_armed,psy_pain@wounded_psy|20|{=best_pistol}" +
          "psy_shoot,psy_pain@{=best_pistol}wounded_psy_shoot,wounded_psy"
      ),
      hpCover: parseWoundedData("20|false"),
      hpFight: parseWoundedData("20|false"),
      hpVictim: parseWoundedData("20|nil"),
      hpState: parseWoundedData("20|wounded_heavy_3@help_heavy"),
      hpStateSee: parseWoundedData("20|wounded_heavy_3@help_heavy"),
    });
  });

  it("should correctly initialize with parameters override", () => {
    const object: GameObject = MockGameObject.mock({ idOverride: 100002 });
    const schemeIni: IniFile = mockIniFile("test2.ltx", {});
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {
        hp_state: "30|wounded_heavy_10@nil",
        hp_state_see: "40|wounded_heavy_11@nil",
        psy_state: "50|wounded_heavy_12@nil",
        hp_victim: "60|wounded_heavy_13@nil",
        hp_cover: "70|wounded_heavy_14@nil",
        hp_fight: "80|wounded_heavy_15@nil",
        help_dialog: "test_help_dialog",
        help_start_dialog: "test_help_start_dialog",
        use_medkit: false,
        autoheal: false,
        enable_talk: false,
        not_for_help: true,
      },
    });

    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, { ini: schemeIni });

    loadSchemeImplementation(SchemeWounded);
    SchemeWounded.initialize(object, ini, "wounded@test", schemeState);

    expect(schemeState).toEqualLuaTables({
      ini: schemeIni,
      autoheal: false,
      helpDialog: "test_help_dialog",
      helpStartDialog: "test_help_start_dialog",
      useMedkit: false,
      isNotForHelp: true,
      isTalkEnabled: false,
      isWoundedInitialized: true,
      logic: {},
      overrides: null,
      signals: null,
      woundedSection: "wounded@test",
      scheme: "wounded",
      section: "wounded@test",
      psyState: parseWoundedData("50|wounded_heavy_12@nil"),
      hpCover: parseWoundedData("70|wounded_heavy_14@nil"),
      hpFight: parseWoundedData("80|wounded_heavy_15@nil"),
      hpVictim: parseWoundedData("60|wounded_heavy_13@nil"),
      hpState: parseWoundedData("30|wounded_heavy_10@nil"),
      hpStateSee: parseWoundedData("40|wounded_heavy_11@nil"),
    });
  });

  it("should correctly initialize when section is nil", () => {
    const object: GameObject = MockGameObject.mock({ idOverride: 100003 });
    const schemeIni: IniFile = mockIniFile("test2.ltx", {});
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {
        hp_state: "30|wounded_heavy_10@nil",
        hp_state_see: "40|wounded_heavy_11@nil",
        psy_state: "50|wounded_heavy_12@nil",
        hp_victim: "60|wounded_heavy_13@nil",
        hp_cover: "70|wounded_heavy_14@nil",
        hp_fight: "80|wounded_heavy_15@nil",
        help_dialog: "test_help_dialog",
        help_start_dialog: "test_help_start_dialog",
        use_medkit: false,
        autoheal: false,
        enable_talk: false,
        not_for_help: true,
      },
    });

    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, { ini: schemeIni });

    loadSchemeImplementation(SchemeWounded);
    SchemeWounded.initialize(object, ini, "nil", schemeState);

    expect(schemeState).toEqualLuaTables({
      ini: schemeIni,
      autoheal: true,
      helpDialog: "dm_help_wounded_medkit_dialog",
      helpStartDialog: null,
      useMedkit: true,
      isNotForHelp: false,
      isTalkEnabled: true,
      isWoundedInitialized: true,
      logic: {},
      overrides: null,
      signals: null,
      woundedSection: "nil",
      scheme: "wounded",
      section: "wounded@test",
      psyState: parseWoundedData(
        "20|{=best_pistol}psy_armed,psy_pain@wounded_psy|20|{=best_pistol}" +
          "psy_shoot,psy_pain@{=best_pistol}wounded_psy_shoot,wounded_psy"
      ),
      hpCover: parseWoundedData("20|false"),
      hpFight: parseWoundedData("20|false"),
      hpVictim: parseWoundedData("20|nil"),
      hpState: parseWoundedData("20|wounded_heavy_2@help_heavy"),
      hpStateSee: parseWoundedData("20|wounded_heavy_2@help_heavy"),
    });
  });

  it("should correctly initialize for zombied", () => {
    const object: GameObject = MockGameObject.mock({
      idOverride: 100004,
      clsid: () => clsid.script_stalker,
      character_community: <T>() => "zombied" as T,
    });
    const schemeIni: IniFile = mockIniFile("test2.ltx", {});
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {},
    });

    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, { ini: schemeIni });

    loadSchemeImplementation(SchemeWounded);
    SchemeWounded.initialize(object, ini, "wounded@test", schemeState);

    expect(schemeState).toEqualLuaTables({
      ini: schemeIni,
      autoheal: true,
      helpDialog: null,
      helpStartDialog: null,
      useMedkit: false,
      isNotForHelp: true,
      isTalkEnabled: true,
      isWoundedInitialized: true,
      logic: {},
      overrides: null,
      signals: null,
      woundedSection: "wounded@test",
      scheme: "wounded",
      section: "wounded@test",
      psyState: parseWoundedData(""),
      hpCover: parseWoundedData("40|false"),
      hpFight: parseWoundedData("40|false"),
      hpVictim: parseWoundedData("40|nil"),
      hpState: parseWoundedData("40|wounded_zombie@nil"),
      hpStateSee: parseWoundedData("40|wounded_zombie@nil"),
    });
  });

  it("should correctly initialize for monolith", () => {
    const object: GameObject = MockGameObject.mock({
      idOverride: 100004,
      clsid: () => clsid.script_stalker,
      character_community: <T>() => "monolith" as T,
    });
    const schemeIni: IniFile = mockIniFile("test2.ltx", {});
    const ini: IniFile = mockIniFile("test.ltx", {
      "wounded@test": {},
    });

    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, { ini: schemeIni });

    loadSchemeImplementation(SchemeWounded);
    SchemeWounded.initialize(object, ini, "wounded@test", schemeState);

    expect(schemeState).toEqualLuaTables({
      ini: schemeIni,
      autoheal: true,
      helpDialog: null,
      helpStartDialog: null,
      useMedkit: false,
      isNotForHelp: true,
      isTalkEnabled: true,
      isWoundedInitialized: true,
      logic: {},
      overrides: null,
      signals: null,
      woundedSection: "wounded@test",
      scheme: "wounded",
      section: "wounded@test",
      psyState: parseWoundedData(""),
      hpCover: parseWoundedData("20|false"),
      hpFight: parseWoundedData("20|false"),
      hpVictim: parseWoundedData("20|nil"),
      hpState: parseWoundedData("20|wounded_heavy_3@nil"),
      hpStateSee: parseWoundedData("20|wounded_heavy_3@nil"),
    });
  });
});
