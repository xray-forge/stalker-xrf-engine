import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, clsid } from "xray16";

import { ObjectRestrictionsManager } from "@/engine/core/ai/restriction";
import { TAbstractSchemeConstructor } from "@/engine/core/ai/scheme";
import {
  IBaseSchemeState,
  IRegistryObjectState,
  IRegistryOfflineState,
  registerActor,
  registerObject,
  registerOfflineObject,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { updateObjectMapSpot } from "@/engine/core/managers/map/utils";
import { ISmartTerrainJobDescriptor, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getTerrainJobByObjectId } from "@/engine/core/objects/smart_terrain/job";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat";
import { SchemeMobDeath } from "@/engine/core/schemes/monster/mob_death";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/physical/ph_on_hit";
import { SchemeIdle } from "@/engine/core/schemes/restrictor/sr_idle";
import { IdleManager } from "@/engine/core/schemes/restrictor/sr_idle/IdleManager";
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
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { SchemeMeet } from "@/engine/core/schemes/stalker/meet";
import { SchemePatrol } from "@/engine/core/schemes/stalker/patrol";
import { SchemeReachTask } from "@/engine/core/schemes/stalker/reach_task";
import { SchemeWounded } from "@/engine/core/schemes/stalker/wounded";
import { disableInfoPortion, giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  activateSchemeBySection,
  enableObjectBaseSchemes,
  getSectionToActivate,
  isActiveSection,
  resetObjectGenericSchemesOnSectionSwitch,
} from "@/engine/core/utils/scheme/scheme_logic";
import { loadSchemeImplementation, loadSchemeImplementations } from "@/engine/core/utils/scheme/scheme_setup";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme, ESchemeType, GameObject, IniFile, ServerHumanObject } from "@/engine/lib/types";
import { getSchemeAction, mockSchemeState, resetRegistry } from "@/fixtures/engine/mocks";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject, MockIniFile } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

function loadGenericSchemes(): Array<TAbstractSchemeConstructor> {
  const schemes: Array<TAbstractSchemeConstructor> = [
    SchemeMeet,
    SchemeHelpWounded,
    SchemeCorpseDetection,
    SchemeAbuse,
    SchemeWounded,
    SchemeDeath,
    SchemeDanger,
    SchemeGatherItems,
    SchemeCombatIgnore,
    SchemeHear,
  ];

  schemes.forEach((it) => jest.spyOn(it, "reset").mockImplementation(jest.fn()));

  loadSchemeImplementations($fromArray(schemes));

  return schemes;
}

jest.mock("@/engine/core/objects/smart_terrain/job/job_pick");
jest.mock("@/engine/core/managers/map/utils");

describe("isActiveSection util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check active scheme state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeSection = null;

    expect(isActiveSection(object, "test@test")).toBe(false);

    state.activeSection = "another@test";

    expect(isActiveSection(object, "test@test")).toBe(false);
    expect(isActiveSection(object, "another@test")).toBe(true);
  });
});

describe("getSectionToActivate util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly determine active section", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@empty": {},
      "sr_idle@fallback": {},
      "sr_idle@previous": {},
      "sr_idle@bad": {
        active: "{+test_condition} sr_idle@desired",
      },
      "sr_idle@desired": {
        active: "{+test_condition} sr_idle@desired, sr_idle@fallback",
      },
    });

    registerActor(actor);

    expect(getSectionToActivate(object, ini, "sr_idle@not_existing")).toBe(NIL);
    expect(getSectionToActivate(object, ini, "sr_idle@empty")).toBe(NIL);
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    expect(() => getSectionToActivate(object, ini, "sr_idle@bad")).toThrow();

    giveInfoPortion("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@desired");

    disableInfoPortion("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    const offlineState: IRegistryOfflineState = registerOfflineObject(object.id(), {
      activeSection: "sr_idle@not_existing",
      levelVertexId: 123,
    });

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    offlineState.activeSection = "sr_idle@previous";

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@previous");

    expect(registry.offlineObjects.get(object.id()).activeSection).toBeNull();
  });
});

describe("activateSchemeBySection util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly activate NIL scheme", () => {
    const first: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(first);
    const second: GameObject = MockGameObject.mock();
    const secondState: IRegistryObjectState = registerObject(second);

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@test": {},
    });

    jest.spyOn(Date, "now").mockImplementation(() => 3000);

    firstState.ini = ini;
    secondState.ini = ini;

    firstState.schemeType = ESchemeType.OBJECT;
    secondState.schemeType = ESchemeType.OBJECT;

    // If initialing.
    activateSchemeBySection(first, ini, NIL, null, false);
    expect(firstState.activationTime).toBe(3000);
    expect(firstState.activationGameTime.toString()).toBe(MockCTime.nowTime.toString());
    expect(first.set_nonscript_usable).toHaveBeenCalled();

    // If loading.
    activateSchemeBySection(second, ini, NIL, null, true);
    expect(secondState.activationTime).toBeUndefined();
    expect(secondState.activationGameTime).toBeUndefined();
    expect(first.set_nonscript_usable).toHaveBeenCalled();
  });

  it("should correctly assign smart terrain jobs", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const state: IRegistryObjectState = registerObject(object);
    const terrain: SmartTerrain = new SmartTerrain("smart_terrain");

    registerActor(MockGameObject.mock());

    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(terrain);

    serverObject.m_smart_terrain_id = terrain.id;

    loadGenericSchemes();
    loadSchemeImplementation(SchemePatrol);

    jest.spyOn(SchemePatrol, "activate").mockImplementation(() => mockSchemeState(EScheme.PATROL));

    replaceFunctionMock(getTerrainJobByObjectId, () => ({ section: "patrol@test" }) as ISmartTerrainJobDescriptor);

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "patrol@test": {},
    });

    state.ini = ini;
    state.schemeType = ESchemeType.STALKER;

    activateSchemeBySection(object, ini, null, null, false);

    expect(SchemePatrol.activate).toHaveBeenCalledWith(object, ini, EScheme.PATROL, "patrol@test", null);
    expect(state.activeSection).toBe("patrol@test");
    expect(state.activeScheme).toBe(EScheme.PATROL);
  });

  it("should correctly activate schemes for restrictors", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@test": {},
    });

    registerActor(MockGameObject.mock());

    state.ini = ini;
    state.schemeType = ESchemeType.RESTRICTOR;

    jest.spyOn(SchemeIdle, "activate");
    jest.spyOn(IdleManager.prototype, "activate");

    expect(() => activateSchemeBySection(object, ini, "sr_idle@test", null, false)).toThrow();

    loadGenericSchemes();
    loadSchemeImplementation(SchemeIdle);

    expect(() => activateSchemeBySection(object, ini, "sr_idle@not_existing", null, false)).toThrow();
    activateSchemeBySection(object, ini, "sr_idle@test", null, false);

    expect(state.activeSection).toBe("sr_idle@test");
    expect(state.activeScheme).toBe(EScheme.SR_IDLE);
    expect(SchemeIdle.activate).toHaveBeenCalledWith(object, ini, EScheme.SR_IDLE, "sr_idle@test", null);
    expect(getSchemeAction(state[EScheme.SR_IDLE] as IBaseSchemeState).activate).toHaveBeenCalledWith(object, false);
  });

  it("should correctly change generic sections", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "hit@test": {},
    });

    registerActor(MockGameObject.mock());

    state.ini = ini;
    state.schemeType = ESchemeType.STALKER;

    jest.spyOn(SchemeHit, "activate");
    jest.spyOn(HitManager.prototype, "activate");

    loadGenericSchemes();
    loadSchemeImplementation(SchemeHit);
    activateSchemeBySection(object, ini, "hit@test", null, false);

    expect(state.activeSection).toBe("hit@test");
    expect(state.activeScheme).toBe(EScheme.HIT);
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@test", null);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(255);
    expect(getSchemeAction(state[EScheme.HIT] as IBaseSchemeState).activate).toHaveBeenCalledWith(object, false);

    expect(state.overrides).toEqualLuaTables({
      combatIgnore: null,
      heliHunter: null,
      combatIgnoreKeepWhenAttacked: false,
      combatType: null,
      scriptCombatType: null,
      maxPostCombatTime: 10,
      minPostCombatTime: 5,
      onCombat: null,
      onOffline: {
        "1": {
          infop_check: {},
          infop_set: {},
          section: NIL,
        },
      },
      soundgroup: null,
    });
  });
});

describe("enableObjectBaseSchemes util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly enables schemes for heli", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        on_hit: "hit@another",
      },
    });

    jest.spyOn(SchemeHit, "activate").mockImplementation(() => mockSchemeState(EScheme.HIT));

    loadSchemeImplementation(SchemeHit);

    enableObjectBaseSchemes(object, ini, ESchemeType.HELICOPTER, "sr_idle@first");
    expect(SchemeHit.activate).not.toHaveBeenCalled();

    enableObjectBaseSchemes(object, ini, ESchemeType.HELICOPTER, "sr_idle@second");
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@another");
  });

  it("should correctly enables schemes for items", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        on_hit: "ph_on_hit@another",
      },
    });

    jest.spyOn(SchemePhysicalOnHit, "activate").mockImplementation(() => mockSchemeState(EScheme.PH_ON_HIT));

    loadSchemeImplementation(SchemePhysicalOnHit);

    enableObjectBaseSchemes(object, ini, ESchemeType.OBJECT, "sr_idle@first");
    expect(SchemePhysicalOnHit.activate).not.toHaveBeenCalled();

    enableObjectBaseSchemes(object, ini, ESchemeType.OBJECT, "sr_idle@second");
    expect(SchemePhysicalOnHit.activate).toHaveBeenCalledWith(object, ini, EScheme.PH_ON_HIT, "ph_on_hit@another");
  });

  it("should correctly enables schemes for monsters", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        invulnerable: true,
        on_combat: "mob_combat@another",
        on_death: "mob_death@another",
        on_hit: "hit@another",
      },
    });

    state.ini = ini;

    jest.spyOn(SchemeHit, "activate").mockImplementation(() => mockSchemeState(EScheme.HIT));
    jest.spyOn(SchemeMobCombat, "activate").mockImplementation(() => mockSchemeState(EScheme.MOB_COMBAT));
    jest.spyOn(SchemeMobDeath, "activate").mockImplementation(() => mockSchemeState(EScheme.MOB_DEATH));
    jest.spyOn(SchemeCombatIgnore, "activate").mockImplementation(() => mockSchemeState(EScheme.COMBAT_IGNORE));

    loadSchemeImplementations(
      $fromArray<TAbstractSchemeConstructor>([SchemeMobCombat, SchemeMobDeath, SchemeHit, SchemeCombatIgnore])
    );

    state.activeSection = "sr_idle@first";
    enableObjectBaseSchemes(object, ini, ESchemeType.MONSTER, "sr_idle@first");
    expect(SchemeHit.activate).not.toHaveBeenCalled();
    expect(SchemeMobCombat.activate).not.toHaveBeenCalled();
    expect(SchemeMobDeath.activate).not.toHaveBeenCalled();
    expect(SchemeCombatIgnore.activate).toHaveBeenCalledWith(object, ini, EScheme.COMBAT_IGNORE, null);
    expect(object.invulnerable).toHaveBeenCalledTimes(1);

    state.activeSection = "sr_idle@second";
    enableObjectBaseSchemes(object, ini, ESchemeType.MONSTER, "sr_idle@second");
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@another");
    expect(SchemeMobCombat.activate).toHaveBeenCalledWith(object, ini, EScheme.MOB_COMBAT, "mob_combat@another");
    expect(SchemeMobDeath.activate).toHaveBeenCalledWith(object, ini, EScheme.MOB_DEATH, "mob_death@another");
    expect(SchemeCombatIgnore.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.COMBAT_IGNORE, null);
    expect(object.invulnerable).toHaveBeenCalledTimes(3);
    expect(object.invulnerable).toHaveBeenNthCalledWith(3, true);
  });

  it("should correctly enables schemes for stalkers", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        on_hit: "hit@another",
        on_combat: "combat@another",
        wounded: "wounded@another",
        meet: "meet@another",
        on_death: "death@another",
        info: "info_list",
      },
      info_list: {
        in: "a|b",
        out: "c|d",
      },
    });

    state.ini = ini;

    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeAbuse,
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeCorpseDetection,
      SchemeDanger,
      SchemeDeath,
      SchemeGatherItems,
      SchemeHelpWounded,
      SchemeHit,
      SchemeMeet,
      SchemeReachTask,
      SchemeWounded,
    ];

    schemes.forEach((it) => jest.spyOn(it, "activate").mockImplementation(() => mockSchemeState(it.SCHEME_SECTION)));
    loadSchemeImplementations($fromArray<TAbstractSchemeConstructor>(schemes));
    registerActor(MockGameObject.mock());

    enableObjectBaseSchemes(object, ini, ESchemeType.STALKER, "sr_idle@first");
    expect(SchemeAbuse.activate).toHaveBeenCalledWith(object, ini, EScheme.ABUSE, "sr_idle@first");
    expect(SchemeWounded.activate).toHaveBeenCalledWith(object, ini, EScheme.WOUNDED, null);
    expect(SchemeHelpWounded.activate).toHaveBeenCalledWith(object, ini, EScheme.HELP_WOUNDED, null);
    expect(SchemeAbuse.activate).toHaveBeenCalledWith(object, ini, EScheme.ABUSE, "sr_idle@first");
    expect(SchemeCombat.activate).toHaveBeenCalledWith(object, ini, EScheme.COMBAT, null);
    expect(SchemeCombatIgnore.activate).toHaveBeenCalledWith(object, ini, EScheme.COMBAT_IGNORE, null);
    expect(SchemeCorpseDetection.activate).toHaveBeenCalledWith(object, ini, EScheme.CORPSE_DETECTION, null);
    expect(SchemeDanger.activate).toHaveBeenCalledWith(object, ini, EScheme.DANGER, "danger");
    expect(SchemeDeath.activate).toHaveBeenCalledWith(object, ini, EScheme.DEATH, null);
    expect(SchemeGatherItems.activate).toHaveBeenCalledWith(object, ini, EScheme.GATHER_ITEMS, "gather_items");
    expect(SchemeHit.activate).not.toHaveBeenCalled();
    expect(SchemeMeet.activate).toHaveBeenCalledWith(object, ini, EScheme.MEET, null);
    expect(SchemeReachTask.activate).toHaveBeenCalledWith(object, ini, EScheme.REACH_TASK, null);

    enableObjectBaseSchemes(object, ini, ESchemeType.STALKER, "sr_idle@second");
    expect(SchemeAbuse.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.ABUSE, "sr_idle@second");
    expect(SchemeWounded.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.WOUNDED, "wounded@another");
    expect(SchemeHelpWounded.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.HELP_WOUNDED, null);
    expect(SchemeAbuse.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.ABUSE, "sr_idle@second");
    expect(SchemeCombat.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.COMBAT, "combat@another");
    expect(SchemeCombatIgnore.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.COMBAT_IGNORE, null);
    expect(SchemeCorpseDetection.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.CORPSE_DETECTION, null);
    expect(SchemeDanger.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.DANGER, "danger");
    expect(SchemeDeath.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.DEATH, "death@another");
    expect(SchemeGatherItems.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.GATHER_ITEMS, "gather_items");
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@another");
    expect(SchemeMeet.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.MEET, "meet@another");
    expect(SchemeReachTask.activate).toHaveBeenNthCalledWith(2, object, ini, EScheme.REACH_TASK, null);

    expect(object.give_info_portion).toHaveBeenNthCalledWith(1, "a");
    expect(object.give_info_portion).toHaveBeenNthCalledWith(2, "b");
    expect(object.disable_info_portion).toHaveBeenNthCalledWith(1, "c");
    expect(object.disable_info_portion).toHaveBeenNthCalledWith(2, "d");
  });
});

describe("resetObjectGenericSchemesOnSectionSwitch util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    resetFunctionMock(updateObjectMapSpot);
  });

  it("should correctly reset base schemes", () => {
    registerActor(MockGameObject.mock());

    const stalker: GameObject = MockGameObject.mock();
    const stalkerState: IRegistryObjectState = registerObject(stalker);
    const monster: GameObject = MockGameObject.mock();
    const monsterState: IRegistryObjectState = registerObject(monster);
    const item: GameObject = MockGameObject.mock();
    const itemState: IRegistryObjectState = registerObject(item);
    const restrictor: GameObject = MockGameObject.mock();
    const restrictorState: IRegistryObjectState = registerObject(restrictor);
    const helicopter: GameObject = MockGameObject.mock();
    const helicopterState: IRegistryObjectState = registerObject(helicopter);

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@test": {
        invulnerable: true,
        threshold: "settings",
        group: 99,
        take_items: true,
        can_select_weapon: false,
      },
      settings: {
        ignore_monster: 10,
        max_ignore_distance: 20,
      },
    });

    stalkerState.activeSection = "sr_idle@test";
    monsterState.activeSection = "sr_idle@test";

    stalkerState.ini = ini;
    monsterState.ini = ini;
    itemState.ini = ini;
    restrictorState.ini = ini;
    helicopterState.ini = ini;

    stalkerState.schemeType = ESchemeType.STALKER;
    monsterState.schemeType = ESchemeType.MONSTER;
    itemState.schemeType = ESchemeType.OBJECT;
    restrictorState.schemeType = ESchemeType.RESTRICTOR;
    helicopterState.schemeType = ESchemeType.HELICOPTER;

    // Not registered schemes.
    expect(() => resetObjectGenericSchemesOnSectionSwitch(stalker, EScheme.SR_IDLE, "sr_idle@test")).toThrow();

    const schemes: Array<TAbstractSchemeConstructor> = loadGenericSchemes();
    const mockRestrictorGetter = jest.fn(() => new ObjectRestrictionsManager(stalker));

    jest.spyOn(ObjectRestrictionsManager, "activateForObject").mockImplementation(mockRestrictorGetter);

    loadSchemeImplementations($fromArray(schemes));

    // Check stalkers.
    resetObjectGenericSchemesOnSectionSwitch(stalker, EScheme.SR_IDLE, "sr_idle@test");

    expect(SchemeMeet.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeHelpWounded.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeCorpseDetection.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeAbuse.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeWounded.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeDeath.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeDanger.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeGatherItems.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeCombatIgnore.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");
    expect(SchemeHear.reset).toHaveBeenCalledWith(stalker, EScheme.SR_IDLE, stalkerState, "sr_idle@test");

    expect(updateObjectMapSpot).toHaveBeenCalledTimes(1);
    expect(stalker.max_ignore_monster_distance).toHaveBeenCalledWith(20);
    expect(stalker.ignore_monster_threshold).toHaveBeenCalledWith(10);
    expect(stalker.invulnerable).toHaveBeenNthCalledWith(2, true);
    expect(stalker.change_team).toHaveBeenCalledWith(stalker.team(), stalker.squad(), 99);
    expect(stalker.take_items_enabled).toHaveBeenCalledWith(true);
    expect(stalker.can_select_weapon).toHaveBeenCalledWith(false);

    // Check monsters.
    schemes.forEach((it) => jest.spyOn(it, "reset").mockReset().mockImplementation(jest.fn()));
    mockRestrictorGetter.mockReset().mockImplementation(() => new ObjectRestrictionsManager(monster));

    resetObjectGenericSchemesOnSectionSwitch(monster, EScheme.SR_IDLE, "sr_idle@test");
    expect(mockRestrictorGetter).toHaveBeenCalledTimes(1);
    expect(monster.invulnerable).toHaveBeenNthCalledWith(2, true);
    expect(monster.get_script).toHaveBeenCalledTimes(1);
    expect(SchemeHear.reset).toHaveBeenCalledWith(monster, EScheme.SR_IDLE, monsterState, "sr_idle@test");
    expect(SchemeCombatIgnore.reset).toHaveBeenCalledWith(monster, EScheme.SR_IDLE, monsterState, "sr_idle@test");
    expect(monster.set_manual_invisibility).not.toHaveBeenCalled();

    // Check items.
    schemes.forEach((it) => jest.spyOn(it, "reset").mockReset().mockImplementation(jest.fn()));
    mockRestrictorGetter.mockReset();

    resetObjectGenericSchemesOnSectionSwitch(item, EScheme.SR_IDLE, "sr_idle@test");
    expect(item.set_callback).toHaveBeenCalledWith(callback.use_object, null);
    expect(item.set_nonscript_usable).toHaveBeenCalledWith(true);

    // Does not throw.
    resetObjectGenericSchemesOnSectionSwitch(restrictor, EScheme.SR_IDLE, "sr_idle@test");

    // Does not throw.
    resetObjectGenericSchemesOnSectionSwitch(helicopter, EScheme.SR_IDLE, "sr_idle@test");
  });

  it("should correctly reset bloodsucker state", () => {
    const monster: GameObject = MockGameObject.mock({
      clsid: clsid.bloodsucker_s,
    });
    const state: IRegistryObjectState = registerObject(monster);

    state.schemeType = ESchemeType.MONSTER;
    state.ini = MockIniFile.mock("test.ltx", {
      "sr_idle@test": {
        can_select_weapon: false,
      },
    });

    loadGenericSchemes();

    resetObjectGenericSchemesOnSectionSwitch(monster, EScheme.SR_IDLE, "sr_idle@test");
    expect(monster.set_manual_invisibility).toHaveBeenNthCalledWith(1, true);

    resetObjectGenericSchemesOnSectionSwitch(monster, EScheme.NIL, NIL);
    expect(monster.set_manual_invisibility).toHaveBeenNthCalledWith(2, false);
  });
});
