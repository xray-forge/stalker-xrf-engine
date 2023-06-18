import { describe, expect, it, jest } from "@jest/globals";
import { callback, clsid } from "xray16";

import {
  IRegistryObjectState,
  IStoredOfflineObject,
  registerActor,
  registerObject,
  registerOfflineObject,
  registry,
} from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/interface";
import {
  ESchemeEvent,
  IBaseSchemeState,
  ObjectRestrictionsManager,
  TAbstractSchemeConstructor,
} from "@/engine/core/schemes";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore";
import { SchemeCorpseDetection } from "@/engine/core/schemes/corpse_detection";
import { SchemeDanger } from "@/engine/core/schemes/danger";
import { SchemeDeath } from "@/engine/core/schemes/death";
import { SchemeGatherItems } from "@/engine/core/schemes/gather_items";
import { SchemeHear } from "@/engine/core/schemes/hear";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded";
import { SchemeMeet } from "@/engine/core/schemes/meet";
import { SchemeWounded } from "@/engine/core/schemes/wounded";
import { disableInfo, giveInfo } from "@/engine/core/utils/info_portion";
import {
  emitSchemeEvent,
  getSectionToActivate,
  isSectionActive,
  resetObjectGenericSchemesOnSectionSwitch,
} from "@/engine/core/utils/scheme/logic";
import { loadSchemeImplementations } from "@/engine/core/utils/scheme/setup";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine/mocks";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("'scheme logic' utils", () => {
  it("'isSectionActive' should correctly check scheme activity", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.active_section = "sr_idle@test";

    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_teleport@test" }))).toBe(
      false
    );
    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_idle@test" }))).toBe(
      true
    );

    state.active_section = "sr_teleport@test";

    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_teleport@test" }))).toBe(
      true
    );
    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_idle@test" }))).toBe(
      false
    );
  });

  it("'emitSchemeEvent' should correctly emit events", () => {
    const object: ClientObject = mockClientGameObject();
    const schemeState: IBaseSchemeState = mockSchemeState(object, EScheme.MEET);
    const mockAction = {
      activateScheme: jest.fn(),
      deactivate: jest.fn(),
      onDeath: jest.fn(),
      onCutscene: jest.fn(),
      onExtrapolate: jest.fn(),
      net_destroy: jest.fn(),
      onHit: jest.fn(),
      resetScheme: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      onUse: jest.fn(),
      onWaypoint: jest.fn(),
    };

    expect(() => emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME)).not.toThrow();

    schemeState.actions = new LuaTable();
    expect(() => emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME)).not.toThrow();

    schemeState.actions.set(mockAction, true);

    emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME, object, 1, 2, 3);
    expect(mockAction.activateScheme).toHaveBeenCalledWith(object, 1, 2, 3);

    emitSchemeEvent(object, schemeState, ESchemeEvent.DEACTIVATE);
    expect(mockAction.deactivate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.DEATH);
    expect(mockAction.onDeath).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.CUTSCENE);
    expect(mockAction.onCutscene).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.EXTRAPOLATE);
    expect(mockAction.onExtrapolate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.NET_DESTROY);
    expect(mockAction.net_destroy).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.HIT);
    expect(mockAction.onHit).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.RESET_SCHEME);
    expect(mockAction.resetScheme).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.SAVE);
    expect(mockAction.save).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.UPDATE);
    expect(mockAction.update).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.USE);
    expect(mockAction.onUse).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.WAYPOINT);
    expect(mockAction.onWaypoint).toHaveBeenCalledTimes(1);
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

  it("'activateSchemeBySection' should correctly activate scheme for objects", () => {
    // todo;
  });

  it("'configureObjectSchemes' should correctly configure scheme for objects", () => {
    // todo;
  });

  it("'getObjectGenericSchemeOverrides' should correctly get overrides", () => {
    // todo;
  });

  it("'initializeObjectSchemeLogic' should correctly initialize scheme logic", () => {
    // todo;
  });

  it("'resetObjectGenericSchemesOnSectionSwitch' should correctly reset base schemes", () => {
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

    stalkerState.active_section = "sr_idle@test";
    monsterState.active_section = "sr_idle@test";

    stalkerState.ini = ini;
    monsterState.ini = ini;
    itemState.ini = ini;
    restrictorState.ini = ini;
    helicopterState.ini = ini;

    stalkerState.schemeType = ESchemeType.STALKER;
    monsterState.schemeType = ESchemeType.MONSTER;
    itemState.schemeType = ESchemeType.ITEM;
    restrictorState.schemeType = ESchemeType.RESTRICTOR;
    helicopterState.schemeType = ESchemeType.HELI;

    // Not registered schemes.
    expect(() => resetObjectGenericSchemesOnSectionSwitch(stalker, EScheme.SR_IDLE, "sr_idle@test")).toThrow();

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

    const mockRestrictorGetter = jest.fn(() => new ObjectRestrictionsManager(stalker));

    jest.spyOn(ObjectRestrictionsManager, "activateForObject").mockImplementation(mockRestrictorGetter);
    schemes.forEach((it) => jest.spyOn(it, "reset").mockImplementation(jest.fn()));
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

    resetObjectGenericSchemesOnSectionSwitch(monster, EScheme.SR_IDLE, "sr_idle@test");
    expect(monster.set_manual_invisibility).toHaveBeenNthCalledWith(1, true);

    resetObjectGenericSchemesOnSectionSwitch(monster, EScheme.NIL, NIL);
    expect(monster.set_manual_invisibility).toHaveBeenNthCalledWith(2, false);
  });
});
