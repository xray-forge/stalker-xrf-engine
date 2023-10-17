import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  CUSTOM_DATA,
  IRegistryObjectState,
  registerActor,
  registerObject,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { TAbstractSchemeConstructor } from "@/engine/core/objects/ai/scheme";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat";
import { SchemeHear } from "@/engine/core/schemes/shared/hear";
import { SchemeAbuse } from "@/engine/core/schemes/stalker/abuse";
import { SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/stalker/combat_ignore";
import { SchemeCorpseDetection } from "@/engine/core/schemes/stalker/corpse_detection";
import { SchemeDanger } from "@/engine/core/schemes/stalker/danger";
import { SchemeDeath } from "@/engine/core/schemes/stalker/death";
import { SchemeGatherItems } from "@/engine/core/schemes/stalker/gather_items";
import { SchemeHelpWounded } from "@/engine/core/schemes/stalker/help_wounded";
import { SchemeHit } from "@/engine/core/schemes/stalker/hit";
import { SchemeMeet } from "@/engine/core/schemes/stalker/meet";
import { SchemeReachTask } from "@/engine/core/schemes/stalker/reach_task";
import { SchemeWounded } from "@/engine/core/schemes/stalker/wounded";
import { ISmartTerrainJobDescriptor } from "@/engine/core/utils/job";
import {
  configureObjectSchemes,
  initializeObjectSchemeLogic,
  initializeObjectSectionItems,
} from "@/engine/core/utils/scheme/scheme_initialization";
import { loadSchemeImplementations } from "@/engine/core/utils/scheme/scheme_setup";
import { AnyObject, EGameObjectRelation, EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { FILES_MOCKS, mockGameObject, mockIniFile, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("scheme initialization utils", () => {
  beforeEach(() => {
    registry.schemes = new LuaTable();
    registry.actor = null as unknown as GameObject;
    registerSimulator();
  });

  it("configureObjectSchemes should correctly configure scheme for objects if section does not exist", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {});

    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeAbuse,
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeCorpseDetection,
      SchemeDanger,
      SchemeDeath,
      SchemeGatherItems,
      SchemeHear,
      SchemeHelpWounded,
      SchemeHit,
      SchemeMeet,
      SchemeWounded,
      SchemeReachTask,
    ];

    schemes.forEach((it) => {
      jest.spyOn(it, "disable").mockImplementation(() => {});
      jest.spyOn(it, "activate").mockImplementation(() => {});
      jest.spyOn(it, "reset").mockImplementation(() => {});
    });

    resetFunctionMock(registry.simulator.create);

    loadSchemeImplementations($fromArray(schemes));

    expect(() => {
      configureObjectSchemes(object, ini, "test.ltx", ESchemeType.STALKER, "logics", "test-smart");
    }).toThrow();
    configureObjectSchemes(object, ini, "test.ltx", ESchemeType.STALKER, "logics", "");

    expect(state.iniFilename).toBe("test.ltx");
    expect(state.sectionLogic).toBe("logics");
    expect(state.jobIni).toBeUndefined();
    expect(state.activeSection).toBeNull();

    expect(SchemeAbuse.activate).toHaveBeenCalled();
    expect(SchemeCombat.activate).toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalled();
    expect(SchemeCorpseDetection.activate).toHaveBeenCalled();
    expect(SchemeDanger.activate).toHaveBeenCalled();
    expect(SchemeDeath.activate).toHaveBeenCalled();
    expect(SchemeGatherItems.activate).toHaveBeenCalled();
    expect(SchemeHelpWounded.activate).toHaveBeenCalled();
    expect(SchemeMeet.activate).toHaveBeenCalled();
    expect(SchemeWounded.activate).toHaveBeenCalled();
    expect(SchemeReachTask.activate).toHaveBeenCalled();

    expect(registry.trade.get(object.id())).toBeDefined();
    expect(registry.simulator.create).not.toHaveBeenCalled();
  });

  it("configureObjectSchemes should correctly configure scheme for objects if cfg section exists", () => {
    const object: GameObject = mockGameObject();
    const smartTerrain: SmartTerrain = new SmartTerrain("smart_terrain");

    mockServerAlifeHumanStalker({
      id: object.id(),
      m_smart_terrain_id: smartTerrain.id,
    });

    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      logics: { cfg: "logics-descriptor.ltx" },
    });

    (FILES_MOCKS as Record<string, AnyObject>)["logics-descriptor.ltx"] = {
      logics: {
        spawn: "list",
      },
      list: {
        ak74: 2,
      },
    };

    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeAbuse,
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeCorpseDetection,
      SchemeDanger,
      SchemeDeath,
      SchemeGatherItems,
      SchemeHear,
      SchemeHelpWounded,
      SchemeHit,
      SchemeMeet,
      SchemeWounded,
      SchemeReachTask,
    ];

    schemes.forEach((it) => {
      jest.spyOn(it, "disable").mockImplementation(() => {});
      jest.spyOn(it, "activate").mockImplementation(() => {});
      jest.spyOn(it, "reset").mockImplementation(() => {});
    });

    jest
      .spyOn(smartTerrain, "getJobByObjectId")
      .mockImplementation(() => ({ iniPath: "job_test.ltx" }) as ISmartTerrainJobDescriptor);

    resetFunctionMock(registry.simulator.create);

    loadSchemeImplementations($fromArray(schemes));

    expect(() => {
      configureObjectSchemes(object, ini, "test.ltx", ESchemeType.STALKER, "logics_not_existing", "test-smart");
    }).toThrow();
    configureObjectSchemes(object, ini, "test.ltx", ESchemeType.STALKER, "logics", "test-smart");

    expect(state.iniFilename).toBe("logics-descriptor.ltx");
    expect(state.sectionLogic).toBe("logics");
    expect(state.jobIni).toBe("job_test.ltx");
    expect(state.activeSection).toBeNull();

    expect(SchemeAbuse.activate).toHaveBeenCalled();
    expect(SchemeCombat.activate).toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalled();
    expect(SchemeCorpseDetection.activate).toHaveBeenCalled();
    expect(SchemeDanger.activate).toHaveBeenCalled();
    expect(SchemeDeath.activate).toHaveBeenCalled();
    expect(SchemeGatherItems.activate).toHaveBeenCalled();
    expect(SchemeHelpWounded.activate).toHaveBeenCalled();
    expect(SchemeMeet.activate).toHaveBeenCalled();
    expect(SchemeWounded.activate).toHaveBeenCalled();
    expect(SchemeReachTask.activate).toHaveBeenCalled();

    expect(registry.trade.get(object.id())).toBeDefined();
    expect(registry.simulator.create).toHaveBeenCalledTimes(2);
  });

  it("initializeObjectSchemeLogic should correctly initialize scheme logic on init", () => {
    const ini: IniFile = mockIniFile("object-test.ltx", {
      logic: {
        active: "mob_combat@test",
        relation: "enemy",
        sympathy: 1250,
      },
      "mob_combat@test": {},
    });
    const actor: GameObject = mockGameObject();
    const object: GameObject = mockGameObject({
      spawn_ini: () => ini,
    });
    const state: IRegistryObjectState = registerObject(object);
    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeMobCombat,
      SchemeCombatIgnore,
      SchemeDeath,
      SchemeDanger,
      SchemeHear,
    ];

    registerActor(actor);
    loadSchemeImplementations($fromArray(schemes));

    schemes.forEach((it) => {
      jest.spyOn(it, "disable").mockImplementation(() => {});
      jest.spyOn(it, "activate").mockImplementation(() => {});
      jest.spyOn(it, "reset").mockImplementation(() => {});
    });

    initializeObjectSchemeLogic(object, state, false, ESchemeType.MONSTER);

    expect(state.activeScheme).toBe(EScheme.MOB_COMBAT);
    expect(state.activeSection).toBe("mob_combat@test");
    expect(state.schemeType).toBe(ESchemeType.MONSTER);
    expect(state.iniFilename).toBe(CUSTOM_DATA);
    expect(state.ini).toBe(ini);
    expect(state.sectionLogic).toBe("logic");

    expect(object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, actor);
    expect(object.set_sympathy).toHaveBeenCalledWith(1250);

    expect(SchemeMobCombat.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalled();
    expect(SchemeCombatIgnore.reset).toHaveBeenCalled();
    expect(SchemeHear.reset).toHaveBeenCalled();
    expect(SchemeMobCombat.activate).toHaveBeenCalled();
  });

  it("initializeObjectSchemeLogic should correctly initialize scheme logic on load", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    initializeObjectSchemeLogic(object, state, true, ESchemeType.MONSTER);

    expect(state.activeScheme).toBeUndefined();
    expect(state.activeSection).toBeUndefined();

    state.loadedActiveSection = "mob_combat@test";
    state.loadedSectionLogic = "mob_combat@test";
    state.loadedIniFilename = "initializeObjectSchemeLogic-test.ltx";

    (FILES_MOCKS as Record<string, AnyObject>)[state.loadedIniFilename] = {
      "mob_combat@test": {},
    };

    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeMobCombat,
      SchemeCombatIgnore,
      SchemeDeath,
      SchemeDanger,
      SchemeHear,
    ];

    loadSchemeImplementations($fromArray(schemes));

    schemes.forEach((it) => {
      jest.spyOn(it, "disable").mockImplementation(() => {});
      jest.spyOn(it, "activate").mockImplementation(() => {});
      jest.spyOn(it, "reset").mockImplementation(() => {});
    });

    initializeObjectSchemeLogic(object, state, true, ESchemeType.MONSTER);

    expect(SchemeMobCombat.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalled();
    expect(SchemeCombatIgnore.reset).toHaveBeenCalled();
    expect(SchemeHear.reset).toHaveBeenCalled();
    expect(SchemeMobCombat.activate).toHaveBeenCalled();
  });

  it("initializeObjectSectionItems should correctly skip spawn if section does not exist", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.sectionLogic = "logics";
    state.ini = mockIniFile("test.ltx", {
      logics: {},
    });

    resetFunctionMock(registry.simulator.create);
    initializeObjectSectionItems(object, state);
    expect(registry.simulator.create).not.toHaveBeenCalled();
  });

  it("initializeObjectSectionItems should correctly spawn items on scheme activation", () => {
    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.sectionLogic = "logics";
    state.ini = mockIniFile("test.ltx", {
      logics: {
        spawn: "spawn@test",
      },
      "spawn@test": {
        augA3: 1,
        AR15: 1,
      },
    });

    resetFunctionMock(registry.simulator.create);
    initializeObjectSectionItems(object, state);

    expect(registry.simulator.create).toHaveBeenCalledTimes(2);
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      1,
      "augA3",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      2,
      "AR15",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});
