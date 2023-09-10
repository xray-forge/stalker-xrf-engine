import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback, clsid } from "xray16";

import {
  IRegistryObjectState,
  IStoredOfflineObject,
  registerActor,
  registerObject,
  registerOfflineObject,
  registry,
} from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { IBaseSchemeState, ObjectRestrictionsManager, TAbstractSchemeConstructor } from "@/engine/core/schemes";
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
import { HitManager } from "@/engine/core/schemes/hit/HitManager";
import { SchemeMeet } from "@/engine/core/schemes/meet";
import { SchemeMobCombat } from "@/engine/core/schemes/mob_combat";
import { SchemeMobDeath } from "@/engine/core/schemes/mob_death";
import { SchemePatrol } from "@/engine/core/schemes/patrol";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/ph_on_hit";
import { SchemeReachTask } from "@/engine/core/schemes/reach_task";
import { SchemeIdle } from "@/engine/core/schemes/sr_idle";
import { IdleManager } from "@/engine/core/schemes/sr_idle/IdleManager";
import { SchemeWounded } from "@/engine/core/schemes/wounded";
import { ISmartTerrainJobDescriptor } from "@/engine/core/utils/job";
import { disableInfo, giveInfo } from "@/engine/core/utils/object/object_info_portion";
import {
  activateSchemeBySection,
  enableObjectBaseSchemes,
  getSectionToActivate,
  isActiveSection,
  resetObjectGenericSchemesOnSectionSwitch,
} from "@/engine/core/utils/scheme/scheme_logic";
import { loadSchemeImplementation, loadSchemeImplementations } from "@/engine/core/utils/scheme/scheme_setup";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, EScheme, ESchemeType, IniFile, ServerHumanObject } from "@/engine/lib/types";
import { getSchemeAction } from "@/fixtures/engine/mocks";
import { MockAlifeSimulator, mockClientGameObject, mockIniFile, mockServerAlifeHumanStalker } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

describe("'scheme logic' utils", () => {
  /**
   * todo;
   */
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

  beforeEach(() => {
    registry.schemes = new LuaTable();
    registry.actor = null as unknown as ClientObject;
  });

  it("'isActiveSection' should correctly check active scheme state", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.activeSection = null;

    expect(isActiveSection(object, "test@test")).toBe(false);

    state.activeSection = "another@test";

    expect(isActiveSection(object, "test@test")).toBe(false);
    expect(isActiveSection(object, "another@test")).toBe(true);
  });

  it("'getSectionToActivate' should correctly determine active section", () => {
    const actor: ClientObject = mockClientGameObject();
    const object: ClientObject = mockClientGameObject();

    const ini: IniFile = mockIniFile("test.ltx", {
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

    giveInfo("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@desired");

    disableInfo("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    const offlineState: IStoredOfflineObject = registerOfflineObject(object.id(), {
      activeSection: "sr_idle@not_existing",
      levelVertexId: 123,
    });

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    offlineState.activeSection = "sr_idle@previous";

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@previous");

    expect(registry.offlineObjects.get(object.id()).activeSection).toBeNull();
  });

  it("'activateSchemeBySection' should correctly activate NIL scheme", () => {
    const first: ClientObject = mockClientGameObject();
    const firstState: IRegistryObjectState = registerObject(first);
    const second: ClientObject = mockClientGameObject();
    const secondState: IRegistryObjectState = registerObject(second);

    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@test": {},
    });

    jest.spyOn(Date, "now").mockImplementation(() => 3000);

    firstState.ini = ini;
    secondState.ini = ini;

    firstState.schemeType = ESchemeType.ITEM;
    secondState.schemeType = ESchemeType.ITEM;

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

  it("'activateSchemeBySection' should correctly assign smart terrain jobs", () => {
    const object: ClientObject = mockClientGameObject();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({ id: object.id() });
    const state: IRegistryObjectState = registerObject(object);
    const smartTerrain: SmartTerrain = new SmartTerrain("smart_terrain");

    registerActor(mockClientGameObject());

    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(smartTerrain);

    serverObject.m_smart_terrain_id = smartTerrain.id;

    loadGenericSchemes();
    loadSchemeImplementation(SchemePatrol);

    jest.spyOn(SchemePatrol, "activate").mockImplementation(() => {});
    jest.spyOn(smartTerrain, "getJobByObjectId").mockImplementation(
      () =>
        ({
          section: "patrol@test",
        }) as ISmartTerrainJobDescriptor
    );

    const ini: IniFile = mockIniFile("test.ltx", {
      "patrol@test": {},
    });

    state.ini = ini;
    state.schemeType = ESchemeType.STALKER;

    activateSchemeBySection(object, ini, null, null, false);

    expect(SchemePatrol.activate).toHaveBeenCalledWith(object, ini, EScheme.PATROL, "patrol@test", null);
    expect(state.activeSection).toBe("patrol@test");
    expect(state.activeScheme).toBe(EScheme.PATROL);
  });

  it("'activateSchemeBySection' should correctly activate schemes for restrictors", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@test": {},
    });

    registerActor(mockClientGameObject());

    state.ini = ini;
    state.schemeType = ESchemeType.RESTRICTOR;

    jest.spyOn(SchemeIdle, "activate");
    jest.spyOn(IdleManager.prototype, "resetScheme");

    expect(() => activateSchemeBySection(object, ini, "sr_idle@test", null, false)).toThrow();

    loadGenericSchemes();
    loadSchemeImplementation(SchemeIdle);

    expect(() => activateSchemeBySection(object, ini, "sr_idle@not_existing", null, false)).toThrow();
    activateSchemeBySection(object, ini, "sr_idle@test", null, false);

    expect(state.activeSection).toBe("sr_idle@test");
    expect(state.activeScheme).toBe(EScheme.SR_IDLE);
    expect(SchemeIdle.activate).toHaveBeenCalledWith(object, ini, EScheme.SR_IDLE, "sr_idle@test", null);
    expect(getSchemeAction(state[EScheme.SR_IDLE] as IBaseSchemeState).resetScheme).toHaveBeenCalledWith(false, object);
  });

  it("'activateSchemeBySection' should correctly change generic sections", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "hit@test": {},
    });

    registerActor(mockClientGameObject());

    state.ini = ini;
    state.schemeType = ESchemeType.STALKER;

    jest.spyOn(SchemeHit, "activate");
    jest.spyOn(HitManager.prototype, "activateScheme");
    jest.spyOn(MapDisplayManager.getInstance(), "updateObjectMapSpot").mockImplementation(jest.fn());

    loadGenericSchemes();
    loadSchemeImplementation(SchemeHit);
    activateSchemeBySection(object, ini, "hit@test", null, false);

    expect(state.activeSection).toBe("hit@test");
    expect(state.activeScheme).toBe(EScheme.HIT);
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@test", null);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(255);
    expect(getSchemeAction(state[EScheme.HIT] as IBaseSchemeState).activateScheme).toHaveBeenCalledWith(false, object);

    expect(state.overrides).toEqualLuaTables({
      combat_ignore: null,
      combat_ignore_keep_when_attacked: false,
      combat_type: null,
      max_post_combat_time: 10,
      min_post_combat_time: 5,
      on_combat: null,
      on_offline_condlist: {
        "1": {
          infop_check: {},
          infop_set: {},
          section: NIL,
        },
      },
      soundgroup: null,
    });
  });

  it("'enableObjectBaseSchemes' should correctly enables schemes for heli", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        on_hit: "hit@another",
      },
    });

    jest.spyOn(SchemeHit, "activate").mockImplementation(() => {});

    loadSchemeImplementation(SchemeHit);

    enableObjectBaseSchemes(object, ini, ESchemeType.HELICOPTER, "sr_idle@first");
    expect(SchemeHit.activate).not.toHaveBeenCalled();

    enableObjectBaseSchemes(object, ini, ESchemeType.HELICOPTER, "sr_idle@second");
    expect(SchemeHit.activate).toHaveBeenCalledWith(object, ini, EScheme.HIT, "hit@another");
  });

  it("'enableObjectBaseSchemes' should correctly enables schemes for items", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        on_hit: "ph_on_hit@another",
      },
    });

    jest.spyOn(SchemePhysicalOnHit, "activate").mockImplementation(() => {});

    loadSchemeImplementation(SchemePhysicalOnHit);

    enableObjectBaseSchemes(object, ini, ESchemeType.ITEM, "sr_idle@first");
    expect(SchemePhysicalOnHit.activate).not.toHaveBeenCalled();

    enableObjectBaseSchemes(object, ini, ESchemeType.ITEM, "sr_idle@second");
    expect(SchemePhysicalOnHit.activate).toHaveBeenCalledWith(object, ini, EScheme.PH_ON_HIT, "ph_on_hit@another");
  });

  it("'enableObjectBaseSchemes' should correctly enables schemes for monsters", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@first": {},
      "sr_idle@second": {
        invulnerable: true,
        on_combat: "mob_combat@another",
        on_death: "mob_death@another",
        on_hit: "hit@another",
      },
    });

    state.ini = ini;

    jest.spyOn(SchemeHit, "activate").mockImplementation(() => {});
    jest.spyOn(SchemeMobCombat, "activate").mockImplementation(() => {});
    jest.spyOn(SchemeMobDeath, "activate").mockImplementation(() => {});
    jest.spyOn(SchemeCombatIgnore, "activate").mockImplementation(() => {});

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

  it("'enableObjectBaseSchemes' should correctly enables schemes for stalkers", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
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

    schemes.forEach((it) => jest.spyOn(it, "activate").mockImplementation(() => {}));
    loadSchemeImplementations($fromArray<TAbstractSchemeConstructor>(schemes));
    registerActor(mockClientGameObject());

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

  it("'resetObjectGenericSchemesOnSectionSwitch' should correctly reset base schemes", () => {
    registerActor(mockClientGameObject());

    const stalker: ClientObject = mockClientGameObject();
    const stalkerState: IRegistryObjectState = registerObject(stalker);
    const monster: ClientObject = mockClientGameObject();
    const monsterState: IRegistryObjectState = registerObject(monster);
    const item: ClientObject = mockClientGameObject();
    const itemState: IRegistryObjectState = registerObject(item);
    const restrictor: ClientObject = mockClientGameObject();
    const restrictorState: IRegistryObjectState = registerObject(restrictor);
    const helicopter: ClientObject = mockClientGameObject();
    const helicopterState: IRegistryObjectState = registerObject(helicopter);

    const ini: IniFile = mockIniFile("test.ltx", {
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
    itemState.schemeType = ESchemeType.ITEM;
    restrictorState.schemeType = ESchemeType.RESTRICTOR;
    helicopterState.schemeType = ESchemeType.HELICOPTER;

    // Not registered schemes.
    expect(() => resetObjectGenericSchemesOnSectionSwitch(stalker, EScheme.SR_IDLE, "sr_idle@test")).toThrow();

    const schemes: Array<TAbstractSchemeConstructor> = loadGenericSchemes();
    const mockRestrictorGetter = jest.fn(() => new ObjectRestrictionsManager(stalker));

    jest.spyOn(ObjectRestrictionsManager, "activateForObject").mockImplementation(mockRestrictorGetter);
    jest.spyOn(MapDisplayManager.getInstance(), "updateObjectMapSpot").mockImplementation(jest.fn());

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

    expect(MapDisplayManager.getInstance().updateObjectMapSpot).toHaveBeenCalledTimes(1);
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

  it("'resetObjectGenericSchemesOnSectionSwitch' should correctly reset bloodsucker state", () => {
    const monster: ClientObject = mockClientGameObject({
      clsid: () => clsid.bloodsucker_s,
    });
    const state: IRegistryObjectState = registerObject(monster);

    state.schemeType = ESchemeType.MONSTER;
    state.ini = mockIniFile("test.ltx", {
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
