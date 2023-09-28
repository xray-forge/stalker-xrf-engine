import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { getActorAvailableMedKit, getNpcSpeaker, isObjectName } from "@/engine/core/utils/dialog";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockActorClientGameObject, mockClientGameObject } from "@/fixtures/xray";

describe("reward utils", () => {
  const createObjectWithItems = () =>
    mockClientGameObject({
      inventory: [
        [1, mockClientGameObject({ sectionOverride: medkits.medkit } as Partial<ClientObject>)],
        [2, mockClientGameObject({ sectionOverride: medkits.medkit } as Partial<ClientObject>)],
        [3, mockClientGameObject({ sectionOverride: medkits.medkit_army } as Partial<ClientObject>)],
        [4, mockClientGameObject({ sectionOverride: medkits.medkit_army } as Partial<ClientObject>)],
        [5, mockClientGameObject({ sectionOverride: medkits.medkit_army } as Partial<ClientObject>)],
        [40, mockClientGameObject({ sectionOverride: weapons.wpn_svd } as Partial<ClientObject>)],
        [41, mockClientGameObject({ sectionOverride: weapons.wpn_svd } as Partial<ClientObject>)],
        [50, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
        [51, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
        [52, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
        [53, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
        [54, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
        [55, mockClientGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<ClientObject>)],
      ],
    });

  beforeEach(() => {
    registerActor(mockActorClientGameObject());
    registerSimulator();
  });

  it("getNpcSpeaker should correctly pick speaker", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(getNpcSpeaker(registry.actor, first)).toBe(first);
    expect(getNpcSpeaker(registry.actor, second)).toBe(second);

    expect(getNpcSpeaker(first, registry.actor)).toBe(first);
    expect(getNpcSpeaker(second, registry.actor)).toBe(second);
  });

  it("isObjectName should correctly check name", () => {
    const object: ClientObject = mockClientGameObject({ name: () => "test_complex_name" } as Partial<ClientObject>);

    expect(object.name()).toBe("test_complex_name");
    expect(isObjectName(object, "another")).toBeFalsy();
    expect(isObjectName(object, "test_complex_name")).toBeTruthy();
    expect(isObjectName(object, "complex_name")).toBeTruthy();
    expect(isObjectName(object, "test_complex")).toBeTruthy();
    expect(isObjectName(object, "test")).toBeTruthy();
    expect(isObjectName(object, "complex")).toBeTruthy();
    expect(isObjectName(object, "name")).toBeTruthy();
  });

  it("getActorAvailableMedKit should correctly check medkit", () => {
    registerActor(createObjectWithItems());

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBe(medkits.medkit);
    expect(
      getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockClientGameObject())
    ).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBe(medkits.medkit_army);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockClientGameObject())).toBeNull();
  });
});
