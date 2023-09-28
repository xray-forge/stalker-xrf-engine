import { describe, expect, it } from "@jest/globals";

import { registerActor } from "@/engine/core/database";
import {
  actorHasAtLeastOneItem,
  actorHasItem,
  actorHasItems,
  actorHasMedKit,
  objectHasItem,
  setItemCondition,
} from "@/engine/core/utils/item";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockClientGameObject } from "@/fixtures/xray";

describe("item utils", () => {
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

  it("setItemCondition should correctly set condition", () => {
    const object: ClientObject = mockClientGameObject();

    setItemCondition(object, 25);
    expect(object.set_condition).toHaveBeenCalledWith(0.25);

    setItemCondition(object, 100);
    expect(object.set_condition).toHaveBeenNthCalledWith(2, 1);

    setItemCondition(object, 0);
    expect(object.set_condition).toHaveBeenNthCalledWith(3, 0);
  });

  it("objectHasItem should correctly check if object has item", () => {
    const object: ClientObject = createObjectWithItems();

    expect(objectHasItem(object, weapons.wpn_svd)).toBeTruthy();
    expect(objectHasItem(object, medkits.medkit)).toBeTruthy();
    expect(objectHasItem(object, medkits.medkit_army)).toBeTruthy();
    expect(objectHasItem(object, medkits.medkit_scientic)).toBeFalsy();
    expect(objectHasItem(object, weapons.wpn_val)).toBeFalsy();
    expect(objectHasItem(object, weapons.wpn_ak74)).toBeFalsy();

    expect(objectHasItem(object, 1)).toBeTruthy();
    expect(objectHasItem(object, 2)).toBeTruthy();
    expect(objectHasItem(object, 40)).toBeTruthy();
    expect(objectHasItem(object, 50)).toBeTruthy();
    expect(objectHasItem(object, 60)).toBeFalsy();
    expect(objectHasItem(object, 70)).toBeFalsy();
    expect(objectHasItem(object, 100)).toBeFalsy();
  });

  it("actorHasAtLeastOneItem should correctly check if object has item", () => {
    registerActor(createObjectWithItems());

    expect(
      actorHasAtLeastOneItem(MockLuaTable.mockFromArray([medkits.medkit, medkits.medkit_army, medkits.medkit_scientic]))
    ).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([ammo.ammo_gauss, medkits.medkit]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([ammo.ammo_gauss, medkits.medkit_scientic]))).toBeFalsy();

    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([1, 2, 50, 100]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([100, 101, 102, 50]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([100, 101, 102]))).toBeFalsy();

    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([ammo.ammo_gauss, 500]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([weapons.wpn_val, 400]))).toBeFalsy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([ammo.ammo_gauss, 50]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([weapons.wpn_val, 40]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([ammo.ammo_9x18_pmm, 500]))).toBeTruthy();
    expect(actorHasAtLeastOneItem(MockLuaTable.mockFromArray([weapons.wpn_svd, 400]))).toBeTruthy();
  });

  it("actorHasItems should correctly check if object has items", () => {
    registerActor(createObjectWithItems());

    expect(
      actorHasItems(MockLuaTable.mockFromArray([medkits.medkit, medkits.medkit_army, medkits.medkit_scientic]))
    ).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([ammo.ammo_gauss, medkits.medkit]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([ammo.ammo_gauss, medkits.medkit_scientic]))).toBeFalsy();

    expect(actorHasItems(MockLuaTable.mockFromArray([medkits.medkit, medkits.medkit_army]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([ammo.ammo_9x18_pmm, medkits.medkit]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([medkits.medkit_army, weapons.wpn_svd]))).toBeTruthy();

    expect(actorHasItems(MockLuaTable.mockFromArray([1, 2, 40, 50]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([1, 2, 3, 4]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([40, 41, 50, 51]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([100, 101, 102, 50]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([100, 101, 102]))).toBeFalsy();

    expect(actorHasItems(MockLuaTable.mockFromArray([ammo.ammo_gauss, 500]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([weapons.wpn_val, 40]))).toBeFalsy();
    expect(actorHasItems(MockLuaTable.mockFromArray([ammo.ammo_9x18_pmm, 50]))).toBeTruthy();
    expect(actorHasItems(MockLuaTable.mockFromArray([weapons.wpn_svd, 40]))).toBeTruthy();
  });

  it("actorHasItem should correctly check if object has item", () => {
    registerActor(createObjectWithItems());

    expect(actorHasItem(weapons.wpn_svd)).toBeTruthy();
    expect(actorHasItem(weapons.wpn_desert_eagle)).toBeFalsy();
    expect(actorHasItem(weapons.wpn_ak74)).toBeFalsy();
    expect(actorHasItem(medkits.medkit)).toBeTruthy();
    expect(actorHasItem(medkits.medkit_army)).toBeTruthy();
    expect(actorHasItem(ammo.ammo_9x18_pmm)).toBeTruthy();
    expect(actorHasItem(ammo.ammo_gauss)).toBeFalsy();

    expect(actorHasItem(1234)).toBeFalsy();
    expect(actorHasItem(123)).toBeFalsy();
    expect(actorHasItem(12)).toBeFalsy();
    expect(actorHasItem(1)).toBeTruthy();
    expect(actorHasItem(2)).toBeTruthy();
    expect(actorHasItem(3)).toBeTruthy();
    expect(actorHasItem(40)).toBeTruthy();
    expect(actorHasItem(41)).toBeTruthy();
    expect(actorHasItem(50)).toBeTruthy();
    expect(actorHasItem(51)).toBeTruthy();
    expect(actorHasItem(60)).toBeFalsy();
    expect(actorHasItem(61)).toBeFalsy();
  });

  it("actorHasMedKit should correctly check if object has any medkit", () => {
    registerActor(createObjectWithItems());

    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockClientGameObject())).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockClientGameObject())).toBeFalsy();
  });
});
