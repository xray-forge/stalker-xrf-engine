import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { alife } from "xray16";

import { CUSTOM_DATA, IRegistryObjectState, registerActor, registerObject, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { ISmartTerrainJob } from "@/engine/core/objects/server/smart_terrain/types";
import { TAbstractSchemeConstructor } from "@/engine/core/schemes";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { SchemeCombat } from "@/engine/core/schemes/combat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore";
import { SchemeCorpseDetection } from "@/engine/core/schemes/corpse_detection";
import { SchemeDanger } from "@/engine/core/schemes/danger";
import { SchemeDeath } from "@/engine/core/schemes/death";
import { SchemeGatherItems } from "@/engine/core/schemes/gather_items";
import { SchemeHear } from "@/engine/core/schemes/hear";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded";
import { SchemeHit } from "@/engine/core/schemes/hit";
import { SchemeMeet } from "@/engine/core/schemes/meet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob_combat";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task";
import { SchemeWounded } from "@/engine/core/schemes/wounded";
import {
  configureObjectSchemes,
  initializeObjectSchemeLogic,
  initializeObjectSectionItems,
} from "@/engine/core/utils/scheme/initialization";
import { loadSchemeImplementation, loadSchemeImplementations } from "@/engine/core/utils/scheme/setup";
import { AnyObject, ClientObject, EClientObjectRelation, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/utils";
import { FILES_MOCKS, mockClientGameObject, mockIniFile, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("'scheme initialization' utils", () => {
  beforeEach(() => {
    registry.schemes = new LuaTable();
    registry.actor = null as unknown as ClientObject;
  });

  it("'configureObjectSchemes' should correctly configure scheme for objects if section does not exist", () => {
    const object: ClientObject = mockClientGameObject();
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

    resetFunctionMock(alife().create);

    loadSchemeImplementations($fromArray(schemes));
    loadSchemeImplementation(SchemeMeet, EScheme.ACTOR_DIALOGS);

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
    expect(alife().create).not.toHaveBeenCalled();
  });

  it("'configureObjectSchemes' should correctly configure scheme for objects if cfg section exists", () => {
    const object: ClientObject = mockClientGameObject();
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

    jest.spyOn(smartTerrain, "getJob").mockImplementation(() => ({ ini_path: "job_test.ltx" } as ISmartTerrainJob));

    resetFunctionMock(alife().create);

    loadSchemeImplementations($fromArray(schemes));
    loadSchemeImplementation(SchemeMeet, EScheme.ACTOR_DIALOGS);

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
    expect(alife().create).toHaveBeenCalledTimes(2);
  });

  it("'initializeObjectSchemeLogic' should correctly initialize scheme logic on init", () => {
    const ini: IniFile = mockIniFile("object-test.ltx", {
      logic: {
        active: "mob_combat@test",
        relation: "enemy",
        sympathy: 1250,
      },
      "mob_combat@test": {},
    });
    const actor: ClientObject = mockClientGameObject();
    const object: ClientObject = mockClientGameObject({
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

    expect(object.set_relation).toHaveBeenCalledWith(EClientObjectRelation.ENEMY, actor);
    expect(object.set_sympathy).toHaveBeenCalledWith(1250);

    expect(SchemeMobCombat.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.disable).toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalled();
    expect(SchemeCombatIgnore.reset).toHaveBeenCalled();
    expect(SchemeHear.reset).toHaveBeenCalled();
    expect(SchemeMobCombat.activate).toHaveBeenCalled();
  });

  it("'initializeObjectSchemeLogic' should correctly initialize scheme logic on load", () => {
    const object: ClientObject = mockClientGameObject();
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

  it("'initializeObjectSectionItems' should correctly skip spawn if section does not exist", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.sectionLogic = "logics";
    state.ini = mockIniFile("test.ltx", {
      logics: {},
    });

    resetFunctionMock(alife().create);
    initializeObjectSectionItems(object, state);
    expect(alife().create).not.toHaveBeenCalled();
  });

  it("'initializeObjectSectionItems' should correctly spawn items on scheme activation", () => {
    const object: ClientObject = mockClientGameObject();
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

    resetFunctionMock(alife().create);
    initializeObjectSectionItems(object, state);

    expect(alife().create).toHaveBeenCalledTimes(2);
    expect(alife().create).toHaveBeenNthCalledWith(
      1,
      "augA3",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(alife().create).toHaveBeenNthCalledWith(
      2,
      "AR15",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});
