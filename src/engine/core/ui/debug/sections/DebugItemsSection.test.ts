import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyCallable } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockAlifeSimulator, MockCUIScriptWnd } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import {
  getAmmoSections,
  getArtefactsSections,
  getBoosterSections,
  getDetectorsSections,
  getHelmetsSections,
  getOutfitSections,
  getWeaponSections,
} from "@/engine/core/ini";
import { DebugItemListEntry } from "@/engine/core/ui/debug/sections/DebugItemListEntry";
import { DebugItemsSection } from "@/engine/core/ui/debug/sections/DebugItemsSection";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/spawn", () => ({ spawnItemsForObject: jest.fn() }));

jest.mock("@/engine/core/ini", () => {
  const actual = jest.requireActual("@/engine/core/ini") as Record<string, unknown>;

  return {
    ...actual,
    getAmmoSections: jest.fn(() => new LuaTable()),
    getArtefactsSections: jest.fn(() => new LuaTable()),
    getBoosterSections: jest.fn(() => new LuaTable()),
    getDetectorsSections: jest.fn(() => new LuaTable()),
    getHelmetsSections: jest.fn(() => new LuaTable()),
    getOutfitSections: jest.fn(() => new LuaTable()),
    getWeaponSections: jest.fn(() => new LuaTable()),
  };
});

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugItemsSection {
  const section: DebugItemsSection = new DebugItemsSection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugItemsSection", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(spawnItemsForObject);
    [
      getAmmoSections,
      getArtefactsSections,
      getBoosterSections,
      getDetectorsSections,
      getHelmetsSections,
      getOutfitSections,
      getWeaponSections,
    ].forEach((it) => {
      resetFunctionMock(it);
      replaceFunctionMock(it, () => new LuaTable());
    });
  });

  it("should correctly initialize controls and categories", () => {
    const section: DebugItemsSection = createSection();

    expect(section.uiItemsList.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(section.uiItemListMainSize).toBeDefined();
    expect(section.uiItemListNameSize).toBeDefined();
    expect(section.uiItemListDdSize).toBeDefined();

    expect(section.uiCategoriesList.AddItem).toHaveBeenCalledTimes(7);
    expect(section.uiCategoriesList.SetCurrentID).toHaveBeenCalledWith(0);
    expect(getAmmoSections).toHaveBeenCalled();
  });

  it("should fill items list per category", () => {
    const section: DebugItemsSection = createSection();
    const categories: Array<[string, AnyCallable]> = [
      ["outfits", getOutfitSections],
      ["helmets", getHelmetsSections],
      ["weapons", getWeaponSections],
      ["artefacts", getArtefactsSections],
      ["detectors", getDetectorsSections],
      ["ammo", getAmmoSections],
      ["consumables", getBoosterSections],
    ];

    for (const [category, provider] of categories) {
      resetFunctionMock(provider);
      replaceFunctionMock(provider, () => new LuaTable());

      section.fillItemsList(category as never);

      expect(provider).toHaveBeenCalledTimes(1);
    }
  });

  it("should ignore unknown categories when filling items list", () => {
    const section: DebugItemsSection = createSection();

    jest.mocked(section.uiItemsList.RemoveAll).mockClear();
    jest.mocked(section.uiItemsList.AddExistingItem).mockClear();

    section.fillItemsList("not-existing-category" as never);

    expect(section.uiItemsList.RemoveAll).toHaveBeenCalledTimes(1);
    expect(section.uiItemsList.AddExistingItem).not.toHaveBeenCalled();
  });

  it("should add sorted items to the list", () => {
    const section: DebugItemsSection = createSection();

    section.addItemsToList($fromArray(["wpn_svd", "ammo_5.45x39_fmj"]));

    expect(section.uiItemsList.AddExistingItem).toHaveBeenCalledTimes(2);

    const first: DebugItemListEntry = jest.mocked(section.uiItemsList.AddExistingItem).mock
      .calls[0][0] as DebugItemListEntry;

    expect(first).toBeInstanceOf(DebugItemListEntry);
    expect(first.SetWndSize).toHaveBeenCalledWith(section.uiItemListMainSize);
    expect(first.uiInnerNameText.SetWndSize).toHaveBeenCalledWith(section.uiItemListNameSize);
    expect(first.uiInnerSectionText.SetWndSize).toHaveBeenCalledWith(section.uiItemListDdSize);
  });

  it("should refill items list on category change", () => {
    const section: DebugItemsSection = createSection();

    jest.spyOn(section, "fillItemsList");
    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "weapons");

    section.onCategoryChange();

    expect(section.fillItemsList).toHaveBeenCalledWith("weapons");
  });

  it("should not spawn items when game is not started", () => {
    const section: DebugItemsSection = createSection();

    section.onItemSpawn();

    expect(spawnItemsForObject).not.toHaveBeenCalled();
  });

  it("should not spawn items without selection", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugItemsSection = createSection();

    section.uiItemsList.RemoveAll();
    section.onItemSpawn();

    expect(spawnItemsForObject).not.toHaveBeenCalled();
  });

  it("should spawn single selected item for actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugItemsSection = createSection();

    section.uiItemsList.RemoveAll();
    section.addItemToList("wpn_svd");
    section.uiItemsList.SetSelectedIndex(0);

    section.onItemSpawn();

    expect(spawnItemsForObject).toHaveBeenCalledWith(actorGameObject, "wpn_svd", 1);
  });

  it("should spawn a pack of selected ammo for actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugItemsSection = createSection();

    section.uiItemsList.RemoveAll();
    section.addItemToList("ammo_5.45x39_fmj");
    section.uiItemsList.SetSelectedIndex(0);

    section.onItemSpawn();

    expect(spawnItemsForObject).toHaveBeenCalledWith(actorGameObject, "ammo_5.45x39_fmj", 30);
  });
});
