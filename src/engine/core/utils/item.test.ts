import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActor, registerSimulator } from "@/engine/core/database";
import {
  actorHasAtLeastOneItem,
  actorHasItem,
  actorHasItemCount,
  actorHasItems,
  actorHasMedKit,
  getActorAvailableMedKit,
  getAnyObjectPistol,
  getItemInstalledUpgradesList,
  getItemInstalledUpgradesSet,
  getItemOwnerId,
  getItemPrice,
  objectHasItem,
  setItemCondition,
} from "@/engine/core/utils/item";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { pistols, weapons } from "@/engine/lib/constants/items/weapons";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { GameObject } from "@/engine/lib/types";
import { createObjectWithItems, resetRegistry } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { MockAlifeObject, MockGameObject } from "@/fixtures/xray";

describe("getItemPrice util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get item price", () => {
    expect(getItemPrice("wpn_ak74u")).toBe(4000);
    expect(getItemPrice("wpn_abakan")).toBe(5000);
    expect(getItemPrice("wpn_addon_scope")).toBe(2100);
  });
});

describe("getItemOwnerId util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get owner ID", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    MockAlifeObject.mock({ id: first.id(), parentId: 253 });
    MockAlifeObject.mock({ id: second.id(), parentId: MAX_ALIFE_ID });

    const third: GameObject = MockGameObject.mock();

    expect(getItemOwnerId(first.id())).toBe(253);
    expect(getItemOwnerId(second.id())).toBeNull();
    expect(getItemOwnerId(third.id())).toBeNull();
  });
});

describe("setItemCondition util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly set condition", () => {
    const object: GameObject = MockGameObject.mock();

    setItemCondition(object, 25);
    expect(object.set_condition).toHaveBeenCalledWith(0.25);

    setItemCondition(object, 100);
    expect(object.set_condition).toHaveBeenNthCalledWith(2, 1);

    setItemCondition(object, 0);
    expect(object.set_condition).toHaveBeenNthCalledWith(3, 0);
  });
});

describe("objectHasItem util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has item", () => {
    const object: GameObject = createObjectWithItems();

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
});

describe("actorHasAtLeastOneItem util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has item", () => {
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
});

describe("actorHasItems util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has items", () => {
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
});

describe("actorHasItem util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has item", () => {
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
});

describe("actorHasItemCount util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has item count", () => {
    registerActor(createObjectWithItems());

    expect(actorHasItemCount(medkits.medkit, 0)).toBe(true);
    expect(actorHasItemCount(medkits.medkit, 1)).toBe(true);
    expect(actorHasItemCount(medkits.medkit, 2)).toBe(true);
    expect(actorHasItemCount(medkits.medkit, 3)).toBe(false);
    expect(actorHasItemCount(medkits.medkit, 4)).toBe(false);

    expect(actorHasItemCount(weapons.wpn_svd, 2)).toBe(true);
    expect(actorHasItemCount(weapons.wpn_svd, 3)).toBe(false);
  });
});

describe("actorHasMedKit util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check if object has any medkit", () => {
    registerActor(createObjectWithItems());

    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), MockGameObject.mock())).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBeTruthy();
    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeFalsy();

    expect(actorHasMedKit(MockLuaTable.mockFromArray([medkits.medkit]), MockGameObject.mock())).toBeFalsy();
  });
});

describe("getItemInstalledUpgradesList util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get list of installed upgrades", () => {
    expect(getItemInstalledUpgradesList(MockGameObject.mock())).toEqualLuaArrays([]);
    expect(getItemInstalledUpgradesList(MockGameObject.mock({ upgrades: ["a", "b"] }))).toEqualLuaArrays(["a", "b"]);
    expect(getItemInstalledUpgradesList(MockGameObject.mock({ upgrades: ["c"] }))).toEqualLuaArrays(["c"]);
  });
});

describe("getAnyObjectPistol util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get pistol from object inventory", () => {
    const desertEagle: GameObject = MockGameObject.mock({ section: pistols.wpn_desert_eagle });
    const fort: GameObject = MockGameObject.mock({ section: pistols.wpn_fort });

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock({
      inventory: [
        ["a", MockGameObject.mock()],
        ["b", MockGameObject.mock()],
        [weapons.wpn_svd, MockGameObject.mock()],
      ],
    });
    const third: GameObject = MockGameObject.mock({
      inventory: [
        ["a", MockGameObject.mock()],
        [weapons.wpn_svd, MockGameObject.mock()],
        [weapons.wpn_desert_eagle, desertEagle],
      ],
    });
    const fourth: GameObject = MockGameObject.mock({
      inventory: [
        ["a", MockGameObject.mock()],
        [weapons.wpn_fort, fort],
        [weapons.wpn_desert_eagle, desertEagle],
      ],
    });

    expect(getAnyObjectPistol(first)).toBeNull();
    expect(getAnyObjectPistol(second)).toBeNull();
    expect(getAnyObjectPistol(third)).toBe(desertEagle);
    expect(getAnyObjectPistol(fourth)).toBe(fort);
  });
});

describe("getItemInstalledUpgradesSet util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly get list of installed upgrades", () => {
    expect(getItemInstalledUpgradesSet(MockGameObject.mock())).toEqualLuaTables({});
    expect(getItemInstalledUpgradesSet(MockGameObject.mock({ upgrades: ["a", "b"] }))).toEqualLuaTables({
      a: true,
      b: true,
    });
    expect(getItemInstalledUpgradesSet(MockGameObject.mock({ upgrades: ["c"] }))).toEqualLuaTables({ c: true });
  });
});

describe("getActorAvailableMedKit util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check medkit", () => {
    registerActor(createObjectWithItems());

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBe(medkits.medkit);
    expect(
      getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), MockGameObject.mock())
    ).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBe(medkits.medkit_army);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]), MockGameObject.mock())).toBeNull();
  });
});
