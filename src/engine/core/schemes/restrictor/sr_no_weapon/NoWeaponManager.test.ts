import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerActor, registerObject, registry } from "@/engine/core/database";
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
import { mockActorGameObject, mockGameObject } from "@/fixtures/xray";

describe("NoWeaponManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly init scheme", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    expect(manager.actorState).toBe(EActorZoneState.NOWHERE);
  });

  it("should correctly reset scheme", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    jest.spyOn(manager, "updateActorState").mockImplementation(() => {});

    registerActor(mockActorGameObject());
    registry.noWeaponZones.set(object.id(), true);
    manager.actorState = EActorZoneState.INSIDE;

    manager.activate();
    manager.actorState = EActorZoneState.NOWHERE;
    expect(registry.noWeaponZones.get(object.id())).toBeNull();

    expect(manager.updateActorState).toHaveBeenCalled();
  });

  it("should correctly update schema with zone leave", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerActor(mockActorGameObject());

    jest.spyOn(manager, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(manager, "onZoneLeave").mockImplementation(() => {});

    manager.update();

    expect(manager.onZoneLeave).toHaveBeenCalled();
    expect(manager.onZoneEnter).not.toHaveBeenCalled();
  });

  it("should correctly update schema with zone enter", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerActor(mockActorGameObject());

    jest.spyOn(manager, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(manager, "onZoneLeave").mockImplementation(() => {});
    jest.spyOn(object, "inside").mockImplementation(() => true);

    manager.update();

    expect(manager.onZoneEnter).toHaveBeenCalled();
    expect(manager.onZoneLeave).not.toHaveBeenCalled();
  });

  it("should correctly update schema with scheme change", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    registerObject(object);
    registerActor(mockActorGameObject());
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
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    const onZoneEnter = jest.fn();

    EventsManager.getInstance().registerCallback(EGameEvent.ACTOR_ENTER_NO_WEAPON_ZONE, onZoneEnter);

    manager.onZoneEnter();

    manager.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBe(true);
    expect(onZoneEnter).toHaveBeenCalledWith(object);
  });

  it("should correctly update handle leave", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const manager: NoWeaponManager = new NoWeaponManager(object, state);

    const onZoneLeave = jest.fn();

    EventsManager.getInstance().registerCallback(EGameEvent.ACTOR_LEAVE_NO_WEAPON_ZONE, onZoneLeave);

    registry.noWeaponZones.set(object.id(), true);

    manager.onZoneLeave();

    manager.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBeNull();
    expect(onZoneLeave).toHaveBeenCalledWith(object);
  });
});
