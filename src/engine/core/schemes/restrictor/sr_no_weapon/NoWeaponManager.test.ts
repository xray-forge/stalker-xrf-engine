import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, registerActor, registerObject, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NoWeaponManager } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponManager";
import { SchemeNoWeapon } from "@/engine/core/schemes/restrictor/sr_no_weapon/SchemeNoWeapon";
import {
  EActorZoneState,
  ISchemeNoWeaponState,
} from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeCondition, GameObject } from "@/engine/lib/types";
import { mockBaseSchemeLogic, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("NoWeaponManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly init scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    expect(manager.actorState).toBe(EActorZoneState.NOWHERE);
  });

  it("should correctly reset scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    jest.spyOn(manager, "updateActorState").mockImplementation(() => {});

    registerActor(MockGameObject.mockActor());
    registry.noWeaponZones.set(object.id(), true);
    manager.actorState = EActorZoneState.INSIDE;

    manager.activate();
    manager.actorState = EActorZoneState.NOWHERE;
    expect(registry.noWeaponZones.get(object.id())).toBeNull();

    expect(manager.updateActorState).toHaveBeenCalled();
  });

  it("should correctly update schema with zone leave", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerActor(MockGameObject.mockActor());

    jest.spyOn(manager, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(manager, "onZoneLeave").mockImplementation(() => {});

    manager.update();

    expect(manager.onZoneLeave).toHaveBeenCalled();
    expect(manager.onZoneEnter).not.toHaveBeenCalled();
  });

  it("should correctly update schema with zone enter", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerActor(MockGameObject.mockActor());

    jest.spyOn(manager, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(manager, "onZoneLeave").mockImplementation(() => {});
    jest.spyOn(object, "inside").mockImplementation(() => true);

    manager.update();

    expect(manager.onZoneEnter).toHaveBeenCalled();
    expect(manager.onZoneLeave).not.toHaveBeenCalled();
  });

  it("should correctly update schema with scheme change", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON, {
      ini: MockIniFile.mock("test.ltx", {
        "sr_no_weapon@another": {},
      }),
    });
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerObject(object);
    registerActor(MockGameObject.mockActor());
    loadSchemeImplementation(SchemeNoWeapon);

    state.logic = $fromArray([
      mockBaseSchemeLogic({
        name: ESchemeCondition.ON_INFO,
        condlist: parseConditionsList("{+test_info} sr_no_weapon@another"),
      }),
    ]);

    giveInfoPortion("test_info");

    jest.spyOn(manager, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(manager, "onZoneLeave").mockImplementation(() => {});

    manager.update();

    expect(manager.onZoneEnter).not.toHaveBeenCalled();
    expect(manager.onZoneLeave).not.toHaveBeenCalled();
  });

  it("should correctly update handle enter", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    const onZoneEnter = jest.fn();

    getManager(EventsManager).registerCallback(EGameEvent.ACTOR_ENTER_NO_WEAPON_ZONE, onZoneEnter);

    manager.onZoneEnter();

    manager.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBe(true);
    expect(onZoneEnter).toHaveBeenCalledWith(object);
  });

  it("should correctly update handle leave", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    const onZoneLeave = jest.fn();

    getManager(EventsManager).registerCallback(EGameEvent.ACTOR_LEAVE_NO_WEAPON_ZONE, onZoneLeave);

    registry.noWeaponZones.set(object.id(), true);

    manager.onZoneLeave();

    manager.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBe(false);
    expect(onZoneLeave).toHaveBeenCalledWith(object);
  });
});
