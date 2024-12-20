import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { selectBestStalkerWeapon } from "@/engine/core/ai/combat/combat_weapon_select";
import { getManager, registerSimulator } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AnyObject, GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject } from "@/fixtures/xray";

describe("selectBestStalkerWeapon util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should fallback to null if no handlers found", () => {
    expect(selectBestStalkerWeapon(MockGameObject.mock(), MockGameObject.mock())).toBeNull();
    expect(selectBestStalkerWeapon(MockGameObject.mock(), null)).toBeNull();
  });

  it("should handle exceptional cases from callback handlers without throwing", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        data.weaponId = true;
      }
    );

    expect(selectBestStalkerWeapon(MockGameObject.mock(), MockGameObject.mock())).toBeNull();

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        data.weaponId = "test-string";
      }
    );

    expect(selectBestStalkerWeapon(MockGameObject.mock(), MockGameObject.mock())).toBeNull();

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        data.weaponId = {};
      }
    );

    expect(selectBestStalkerWeapon(MockGameObject.mock(), MockGameObject.mock())).toBeNull();
  });

  it("should use weapon from latest event handler", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();

    const firstBestWeapon: GameObject = MockGameObject.mock();
    const secondBestWeapon: GameObject = MockGameObject.mock();

    MockAlifeObject.mock({
      id: firstBestWeapon.id(),
      parentId: object.id(),
      clsid: clsid.wpn_svd,
    });

    MockAlifeObject.mock({
      id: secondBestWeapon.id(),
      parentId: object.id(),
      clsid: clsid.wpn_ak74,
    });

    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        expect(data).toEqual({ weaponId: null });
        data.weaponId = firstBestWeapon.id();
      }
    );

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        expect(data).toEqual({ weaponId: firstBestWeapon.id() });
        data.weaponId = secondBestWeapon.id();
      }
    );

    expect(selectBestStalkerWeapon(object, weapon)).toBe(secondBestWeapon);
  });

  it("should require weapon ownership to use it", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();

    const bestWeapon: GameObject = MockGameObject.mock();

    MockAlifeObject.mock({
      id: bestWeapon.id(),
      clsid: clsid.wpn_svd,
    });

    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        data.weaponId = bestWeapon.id();
      }
    );

    expect(selectBestStalkerWeapon(object, weapon)).toBeNull();
  });

  it("should require weapon cls id to use it", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mock();

    const bestWeapon: GameObject = MockGameObject.mock();

    MockAlifeObject.mock({
      id: bestWeapon.id(),
      parentId: object.id(),
      clsid: clsid.obj_food,
    });

    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(
      EGameEvent.STALKER_WEAPON_SELECT,
      (_: GameObject, __: GameObject, data: AnyObject) => {
        data.weaponId = bestWeapon.id();
      }
    );

    expect(selectBestStalkerWeapon(object, weapon)).toBeNull();
  });
});
