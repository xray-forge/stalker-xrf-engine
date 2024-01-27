import { describe, expect, it, jest } from "@jest/globals";

import { CampManager } from "@/engine/core/ai/camp";
import { registry } from "@/engine/core/database/registry";
import {
  getCampZoneForPosition,
  registerCampZone,
  registerZone,
  resetCampZone,
  unregisterCampZone,
  unregisterZone,
} from "@/engine/core/database/zones";
import { GameObject, IniFile, Vector } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("zones module of the database", () => {
  it("should correctly register zones", () => {
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    const firstZone: GameObject = MockGameObject.mock({ id: 10, section: "test_zone" });
    const secondZone: GameObject = MockGameObject.mock({ id: 20, section: "test_zone" });

    expect(firstZone.id()).toBe(10);
    expect(firstZone.name()).toBe("test_zone_10");

    expect(secondZone.id()).toBe(20);
    expect(secondZone.name()).toBe("test_zone_20");

    registerZone(firstZone);
    registerZone(secondZone);

    expect(registry.zones.length()).toBe(2);
    expect(registry.objects.length()).toBe(2);

    expect(registry.zones.has(firstZone.name())).toBeTruthy();
    expect(registry.zones.has(secondZone.name())).toBeTruthy();
    expect(registry.objects.has(firstZone.id())).toBeTruthy();
    expect(registry.objects.has(secondZone.id())).toBeTruthy();

    unregisterZone(secondZone);

    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);

    expect(registry.zones.has(firstZone.name())).toBeTruthy();
    expect(registry.zones.has(secondZone.name())).toBeFalsy();
    expect(registry.objects.has(firstZone.id())).toBeTruthy();
    expect(registry.objects.has(secondZone.id())).toBeFalsy();

    unregisterZone(firstZone);

    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly register camp zones", () => {
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
    expect(registry.camps.length()).toBe(0);

    const firstZone: GameObject = MockGameObject.mock({ id: 10, section: "test_camp" });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini() as IniFile);
    const secondZone: GameObject = MockGameObject.mock({ id: 20, section: "test_camp" });
    const secondManager: CampManager = new CampManager(secondZone, secondZone.spawn_ini() as IniFile);
    const thirdZone: GameObject = MockGameObject.mock({ id: 30, section: "test_camp" });

    expect(firstZone.id()).toBe(10);
    expect(firstZone.name()).toBe("test_camp_10");

    expect(secondZone.id()).toBe(20);
    expect(secondZone.name()).toBe("test_camp_20");

    expect(thirdZone.id()).toBe(30);
    expect(thirdZone.name()).toBe("test_camp_30");

    registerCampZone(firstZone, firstManager);
    registerCampZone(secondZone, secondManager);
    registerCampZone(thirdZone, null);

    expect(registry.zones.length()).toBe(3);
    expect(registry.objects.length()).toBe(3);
    expect(registry.camps.length()).toBe(2);

    unregisterCampZone(thirdZone);

    expect(registry.zones.length()).toBe(2);
    expect(registry.objects.length()).toBe(2);
    expect(registry.camps.length()).toBe(2);

    unregisterCampZone(secondZone);

    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);
    expect(registry.camps.length()).toBe(1);

    unregisterCampZone(firstZone);

    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
    expect(registry.camps.length()).toBe(0);
  });

  it("should correctly get camp zones for specific locations", () => {
    const position: Vector = MockVector.mock();

    const firstZone: GameObject = MockGameObject.mock({
      id: 10,
      section: "test_camp",
    });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini() as IniFile);
    const secondZone: GameObject = MockGameObject.mock({
      id: 20,
      section: "test_camp",
    });
    const secondManager: CampManager = new CampManager(secondZone, secondZone.spawn_ini() as IniFile);

    jest.spyOn(firstZone, "inside").mockImplementation(() => false);
    jest.spyOn(secondZone, "inside").mockImplementation((it) => it === position);

    expect(getCampZoneForPosition(null)).toBeNull();
    expect(getCampZoneForPosition(position)).toBeNull();
    expect(getCampZoneForPosition(MockVector.mock())).toBeNull();
    expect(getCampZoneForPosition(MockVector.mock(1, 2, 3))).toBeNull();

    registerCampZone(firstZone, firstManager);
    registerCampZone(secondZone, secondManager);

    expect(null).toBeNull();
    expect(getCampZoneForPosition(position)).toBe(secondManager);
    expect(getCampZoneForPosition(MockVector.mock())).toBeNull();
    expect(getCampZoneForPosition(MockVector.mock(1, 2, 3))).toBeNull();

    unregisterCampZone(secondZone);

    expect(getCampZoneForPosition(position)).toBeNull();

    unregisterCampZone(firstZone);
  });

  it("should correctly reset camp zones", () => {
    const firstZone: GameObject = MockGameObject.mock({
      id: 10,
      section: "test_camp",
    });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini() as IniFile);

    registerCampZone(firstZone, firstManager);

    expect(registry.camps.get(firstZone.id())).toBe(firstManager);
    expect(registry.camps.get(firstZone.id()).object).toBe(firstZone);

    const secondZone: GameObject = MockGameObject.mock({
      id: 10,
      section: "test_camp",
    });

    resetCampZone(secondZone);

    expect(registry.camps.get(firstZone.id())).toBe(firstManager);
    expect(registry.camps.get(firstZone.id()).object).toBe(secondZone);

    unregisterCampZone(secondZone);
  });
});
