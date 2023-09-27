import { describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import {
  getCampZoneForPosition,
  registerCampZone,
  registerZone,
  resetCampZone,
  unregisterCampZone,
  unregisterZone,
} from "@/engine/core/database/zones";
import { CampManager } from "@/engine/core/objects/camp";
import { ClientObject, Vector } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("zones module of the database", () => {
  it("should correctly register zones", () => {
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);

    const firstZone: ClientObject = mockClientGameObject({ idOverride: 10, sectionOverride: "test_zone" });
    const secondZone: ClientObject = mockClientGameObject({ idOverride: 20, sectionOverride: "test_zone" });

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

    const firstZone: ClientObject = mockClientGameObject({ idOverride: 10, sectionOverride: "test_camp" });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini());
    const secondZone: ClientObject = mockClientGameObject({ idOverride: 20, sectionOverride: "test_camp" });
    const secondManager: CampManager = new CampManager(secondZone, secondZone.spawn_ini());

    expect(firstZone.id()).toBe(10);
    expect(firstZone.name()).toBe("test_camp_10");

    expect(secondZone.id()).toBe(20);
    expect(secondZone.name()).toBe("test_camp_20");

    registerCampZone(firstZone, firstManager);
    registerCampZone(secondZone, secondManager);

    expect(registry.zones.length()).toBe(2);
    expect(registry.objects.length()).toBe(2);
    expect(registry.camps.length()).toBe(2);

    expect(registry.zones.has(firstZone.name())).toBeTruthy();
    expect(registry.zones.has(secondZone.name())).toBeTruthy();
    expect(registry.camps.has(firstZone.id())).toBeTruthy();
    expect(registry.camps.has(secondZone.id())).toBeTruthy();
    expect(registry.objects.has(firstZone.id())).toBeTruthy();
    expect(registry.objects.has(secondZone.id())).toBeTruthy();

    unregisterCampZone(secondZone);

    expect(registry.zones.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);
    expect(registry.camps.length()).toBe(1);

    expect(registry.zones.has(firstZone.name())).toBeTruthy();
    expect(registry.zones.has(secondZone.name())).toBeFalsy();
    expect(registry.camps.has(firstZone.id())).toBeTruthy();
    expect(registry.camps.has(secondZone.id())).toBeFalsy();
    expect(registry.objects.has(firstZone.id())).toBeTruthy();
    expect(registry.objects.has(secondZone.id())).toBeFalsy();

    unregisterCampZone(firstZone);

    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
    expect(registry.camps.length()).toBe(0);
  });

  it("should correctly get camp zones for specific locations", () => {
    const position: Vector = MockVector.mock();

    const firstZone: ClientObject = mockClientGameObject({
      idOverride: 10,
      sectionOverride: "test_camp",
      inside: () => false,
    });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini());
    const secondZone: ClientObject = mockClientGameObject({
      idOverride: 20,
      sectionOverride: "test_camp",
      inside: (it) => it === position,
    });
    const secondManager: CampManager = new CampManager(secondZone, secondZone.spawn_ini());

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
    const firstZone: ClientObject = mockClientGameObject({
      idOverride: 10,
      sectionOverride: "test_camp",
    });
    const firstManager: CampManager = new CampManager(firstZone, firstZone.spawn_ini());

    registerCampZone(firstZone, firstManager);

    expect(registry.camps.get(firstZone.id())).toBe(firstManager);
    expect(registry.camps.get(firstZone.id()).object).toBe(firstZone);

    const secondZone: ClientObject = mockClientGameObject(firstZone);

    resetCampZone(secondZone);

    expect(registry.camps.get(firstZone.id())).toBe(firstManager);
    expect(registry.camps.get(firstZone.id()).object).toBe(secondZone);

    unregisterCampZone(secondZone);
  });
});
