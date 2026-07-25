import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ServerObject } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockAlifeSimulator, MockCUIScriptWnd } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import { getSectionsWithoutStoryIDs, getSimulationGroupSections, getStalkerSections } from "@/engine/core/ini";
import { Squad } from "@/engine/core/objects/squad";
import { DebugItemListEntry } from "@/engine/core/ui/debug/sections/DebugItemListEntry";
import { DebugSpawnSection } from "@/engine/core/ui/debug/sections/DebugSpawnSection";
import { getNearestServerObject } from "@/engine/core/utils/registry";
import { spawnCreatureNearActor, spawnSquadInSmart } from "@/engine/core/utils/spawn";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/registry", () => ({ getNearestServerObject: jest.fn(() => null) }));
jest.mock("@/engine/core/utils/spawn", () => ({
  spawnCreatureNearActor: jest.fn(),
  spawnSquadInSmart: jest.fn(),
}));

jest.mock("@/engine/core/ini", () => {
  const actual = jest.requireActual("@/engine/core/ini") as Record<string, unknown>;

  return {
    ...actual,
    getSectionsWithoutStoryIDs: jest.fn((sections: unknown) => sections),
    getSimulationGroupSections: jest.fn(() => new LuaTable()),
    getStalkerSections: jest.fn(() => new LuaTable()),
  };
});

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugSpawnSection {
  const section: DebugSpawnSection = new DebugSpawnSection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugSpawnSection", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getNearestServerObject);
    resetFunctionMock(getSimulationGroupSections);
    resetFunctionMock(getStalkerSections);
    resetFunctionMock(spawnCreatureNearActor);
    resetFunctionMock(spawnSquadInSmart);
    replaceFunctionMock(getNearestServerObject, () => null);
    replaceFunctionMock(getSimulationGroupSections, () => new LuaTable());
    replaceFunctionMock(getStalkerSections, () => new LuaTable());
  });

  it("should correctly initialize controls and categories", () => {
    const section: DebugSpawnSection = createSection();

    expect(section.uiItemsList.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(section.uiItemListMainSize).toBeDefined();
    expect(section.uiCategoriesList.AddItem).toHaveBeenCalledTimes(2);
    expect(section.uiCategoriesList.SetCurrentID).toHaveBeenCalledWith(0);
  });

  it("should fill items list per category", () => {
    const section: DebugSpawnSection = createSection();

    resetFunctionMock(getStalkerSections);
    replaceFunctionMock(getStalkerSections, () => new LuaTable());

    section.fillItemsList("stalkers_list" as never);
    expect(getStalkerSections).toHaveBeenCalledTimes(1);

    resetFunctionMock(getSimulationGroupSections);
    replaceFunctionMock(getSimulationGroupSections, () => new LuaTable());

    section.fillItemsList("simulation_group_list" as never);
    expect(getSimulationGroupSections).toHaveBeenCalledTimes(1);
    expect(getSectionsWithoutStoryIDs).toHaveBeenCalled();
  });

  it("should ignore unknown categories when filling items list", () => {
    const section: DebugSpawnSection = createSection();

    jest.mocked(section.uiItemsList.RemoveAll).mockClear();
    jest.mocked(section.uiItemsList.AddExistingItem).mockClear();

    section.fillItemsList("not-existing-category" as never);

    expect(section.uiItemsList.RemoveAll).toHaveBeenCalledTimes(1);
    expect(section.uiItemsList.AddExistingItem).not.toHaveBeenCalled();
  });

  it("should add sorted items to the list", () => {
    const section: DebugSpawnSection = createSection();

    section.addItemsToList($fromArray(["stalker_veteran", "stalker_novice"]));

    expect(section.uiItemsList.AddExistingItem).toHaveBeenCalledTimes(2);
    expect(jest.mocked(section.uiItemsList.AddExistingItem).mock.calls[0][0]).toBeInstanceOf(DebugItemListEntry);
  });

  it("should refill items list on category change", () => {
    const section: DebugSpawnSection = createSection();

    jest.spyOn(section, "fillItemsList");
    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "stalkers_list");

    section.onCategoryChange();

    expect(section.fillItemsList).toHaveBeenCalledWith("stalkers_list");
  });

  it("should not spawn when game is not started", () => {
    const section: DebugSpawnSection = createSection();

    section.onCreatureSpawn();

    expect(spawnCreatureNearActor).not.toHaveBeenCalled();
    expect(spawnSquadInSmart).not.toHaveBeenCalled();
  });

  it("should not spawn without selection", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugSpawnSection = createSection();

    section.uiItemsList.RemoveAll();
    section.onCreatureSpawn();

    expect(spawnCreatureNearActor).not.toHaveBeenCalled();
    expect(spawnSquadInSmart).not.toHaveBeenCalled();
  });

  it("should spawn stalker near actor", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(spawnCreatureNearActor, () => ({ name: () => "spawned_stalker" }) as ServerObject);

    const section: DebugSpawnSection = createSection();

    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "stalkers_list");

    section.uiItemsList.RemoveAll();
    section.addItemToList("stalker_veteran");
    section.uiItemsList.SetSelectedIndex(0);

    section.onCreatureSpawn();

    expect(spawnCreatureNearActor).toHaveBeenCalledWith("stalker_veteran", 10);
    expect(spawnSquadInSmart).not.toHaveBeenCalled();
  });

  it("should spawn squad in nearest smart terrain", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(getNearestServerObject, () => MockSmartTerrain.mock("zat_b40_smart_terrain"));
    replaceFunctionMock(spawnSquadInSmart, () => MockSquad.mock() as Squad);

    const section: DebugSpawnSection = createSection();

    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "simulation_group_list");

    section.uiItemsList.RemoveAll();
    section.addItemToList("stalker_sim_squad_novice");
    section.uiItemsList.SetSelectedIndex(0);

    section.onCreatureSpawn();

    expect(spawnSquadInSmart).toHaveBeenCalledWith("stalker_sim_squad_novice", "zat_b40_smart_terrain");
    expect(spawnCreatureNearActor).not.toHaveBeenCalled();
  });

  it("should skip squad spawn without nearest smart terrain", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugSpawnSection = createSection();

    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "simulation_group_list");

    section.uiItemsList.RemoveAll();
    section.addItemToList("stalker_sim_squad_novice");
    section.uiItemsList.SetSelectedIndex(0);

    section.onCreatureSpawn();

    expect(spawnSquadInSmart).not.toHaveBeenCalled();
  });
});
