import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { getManager, registerActor, registerObject, registry } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { NoWeaponController } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponController";
import { SchemeNoWeapon } from "@/engine/core/schemes/restrictor/sr_no_weapon/SchemeNoWeapon";
import {
  EActorZoneState,
  ISchemeNoWeaponState,
} from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme, ESchemeCondition } from "@/engine/core/schemes/types";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { mockBaseSchemeLogic, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("NoWeaponController", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly init scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    expect(controller.actorState).toBe(EActorZoneState.NOWHERE);
  });

  it("should correctly reset scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    jest.spyOn(controller, "updateActorState").mockImplementation(() => {});

    registerActor(MockGameObject.mockActor());
    registry.noWeaponZones.set(object.id(), true);
    controller.actorState = EActorZoneState.INSIDE;

    controller.activate();
    controller.actorState = EActorZoneState.NOWHERE;
    expect(registry.noWeaponZones.get(object.id())).toBeNull();

    expect(controller.updateActorState).toHaveBeenCalled();
  });

  it("should correctly update schema with zone leave", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    registerActor(MockGameObject.mockActor());

    jest.spyOn(controller, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(controller, "onZoneLeave").mockImplementation(() => {});

    controller.update();

    expect(controller.onZoneLeave).toHaveBeenCalled();
    expect(controller.onZoneEnter).not.toHaveBeenCalled();
  });

  it("should correctly update schema with zone enter", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    registerActor(MockGameObject.mockActor());

    jest.spyOn(controller, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(controller, "onZoneLeave").mockImplementation(() => {});
    jest.spyOn(object, "inside").mockImplementation(() => true);

    controller.update();

    expect(controller.onZoneEnter).toHaveBeenCalled();
    expect(controller.onZoneLeave).not.toHaveBeenCalled();
  });

  it("should correctly update schema with scheme change", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON, {
      ini: MockIniFile.mock("test.ltx", {
        "sr_no_weapon@another": {},
      }),
    });
    const controller: NoWeaponController = new NoWeaponController(object, state);

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

    jest.spyOn(controller, "onZoneEnter").mockImplementation(() => {});
    jest.spyOn(controller, "onZoneLeave").mockImplementation(() => {});

    controller.update();

    expect(controller.onZoneEnter).not.toHaveBeenCalled();
    expect(controller.onZoneLeave).not.toHaveBeenCalled();
  });

  it("should correctly update handle enter", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    const onZoneEnter = jest.fn();

    getManager(EventsManager).registerCallback(EGameEvent.ACTOR_ENTER_NO_WEAPON_ZONE, onZoneEnter);

    controller.onZoneEnter();

    controller.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBe(true);
    expect(onZoneEnter).toHaveBeenCalledWith(object);
  });

  it("should correctly update handle leave", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeNoWeaponState = mockSchemeState(EScheme.SR_NO_WEAPON);
    const controller: NoWeaponController = new NoWeaponController(object, state);

    const onZoneLeave = jest.fn();

    getManager(EventsManager).registerCallback(EGameEvent.ACTOR_LEAVE_NO_WEAPON_ZONE, onZoneLeave);

    registry.noWeaponZones.set(object.id(), true);

    controller.onZoneLeave();

    controller.actorState = EActorZoneState.OUTSIDE;
    expect(registry.noWeaponZones.get(object.id())).toBe(false);
    expect(onZoneLeave).toHaveBeenCalledWith(object);
  });
});
