import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerObject } from "xray16/alias";
import { ACTOR_ID, MAX_ALIFE_ID } from "xray16/lib";
import { MockAlifeObject, MockGameObject, MockIniFile } from "xray16/mocks";

import { weapons } from "@/engine/constants/items/weapons";
import { IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { onItemWeaponGoOnlineFirstTime } from "@/engine/extensions/enhanced_items_drop/enhanced_items_drop_utils";

describe("onItemWeaponGoOnlineFirstTime", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly handle item going online for actor and ignore additions", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    MockAlifeObject.mock({ id: object.id(), parentId: ACTOR_ID });

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementation(() => 0);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();
  });

  it("should ignore world items", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    MockAlifeObject.mock({ id: object.id(), parentId: MAX_ALIFE_ID });

    jest.spyOn(math, "random").mockImplementation(() => 100);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();
  });

  it("should ignore weapons owned by non-NPCs", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });
    const owner: ServerObject = MockAlifeObject.mock();

    MockAlifeObject.mock({ id: object.id(), parentId: owner.id });

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();
  });

  it("should ignore weapons owned by traders", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });
    const owner: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(owner);

    registry.stalkers.set(owner.id(), true);
    state.ini = MockIniFile.mock("test.ltx", { logic: { trade: "custom.ltx" } });
    state.sectionLogic = "logic";
    MockAlifeObject.mock({ id: object.id(), parentId: owner.id() });

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();
  });

  it("should upgrade weapons owned by non-trader NPCs", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });
    const owner: GameObject = MockGameObject.mock();

    registry.stalkers.set(owner.id(), true);
    MockAlifeObject.mock({ id: object.id(), parentId: owner.id() });

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemWeaponGoOnlineFirstTime(object);
    expect(object.add_upgrade).toHaveBeenCalled();
  });
});
