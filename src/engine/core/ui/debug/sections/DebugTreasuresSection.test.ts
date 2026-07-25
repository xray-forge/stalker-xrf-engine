import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, level } from "xray16";
import { ServerObject } from "xray16/alias";
import { AnyObject, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockCUIScriptWnd, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getManager, registry } from "@/engine/core/database";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { ETreasureType, treasureConfig, TreasureManager } from "@/engine/core/managers/treasures";
import { DebugTreasuresSection } from "@/engine/core/ui/debug/sections/DebugTreasuresSection";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

/**
 * @returns Section of the first configured treasure.
 */
function getFirstTreasureSection(): TSection {
  for (const [section] of treasureConfig.TREASURES) {
    return section;
  }

  throw new Error("Expected at least one configured treasure.");
}

// `game.jump_to_level` is not provided by `xray16` mocks, so it is stubbed per test run.
const jumpToLevel = jest.fn();

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugTreasuresSection {
  const section: DebugTreasuresSection = new DebugTreasuresSection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugTreasuresSection", () => {
  beforeEach(() => {
    resetRegistry();
    (game as unknown as AnyObject).jump_to_level = jumpToLevel;
    jumpToLevel.mockReset();
    resetFunctionMock(level.name);
  });

  it("should correctly initialize", () => {
    const section: DebugTreasuresSection = createSection();
    const statisticsManager: StatisticsManager = getManager(StatisticsManager);

    expect(section.currentFilter).toBe("");
    expect(section.currentSection).toBeNull();

    expect(section.uiTotalTreasuresLabel.TextControl().SetText).toHaveBeenCalledWith(
      `Total treasures: ${treasureConfig.TREASURES.length()}`
    );
    expect(section.uiGivenTreasuresLabel.TextControl().SetText).toHaveBeenCalledWith("Given treasures: 0");
    expect(section.uiFoundTreasuresLabel.TextControl().SetText).toHaveBeenCalledWith(
      `Found treasures: ${statisticsManager.actorStatistics.collectedTreasuresCount}`
    );
    expect(section.uiTreasuresList.RemoveAll).toHaveBeenCalled();
    expect(section.uiTreasuresList.AddTextItem).toHaveBeenCalled();
    expect(section.uiTreasureInfoLabel.TextControl().SetText).toHaveBeenCalledWith("");
  });

  it("should filter treasures list by current filter", () => {
    const section: DebugTreasuresSection = createSection();
    const firstSection: TSection = getFirstTreasureSection();

    jest.mocked(section.uiTreasuresList.AddTextItem).mockClear();

    section.currentFilter = "definitely-not-existing-treasure";
    section.initializeState();

    expect(section.uiTreasuresList.AddTextItem).not.toHaveBeenCalled();

    section.currentFilter = firstSection;
    section.initializeState();

    expect(section.uiTreasuresList.AddTextItem).toHaveBeenCalledWith(firstSection);
  });

  it("should build empty description for missing treasure", () => {
    const section: DebugTreasuresSection = createSection();

    expect(section.getTreasureDescription(null)).toBe("");
  });

  it("should build description for existing treasure", () => {
    const section: DebugTreasuresSection = createSection();
    const firstSection: TSection = getFirstTreasureSection();
    const description: string = section.getTreasureDescription(firstSection);

    expect(description).toContain("given:");
    expect(description).toContain("checked:");
    expect(description).toContain("items remain:");
    expect(description).toContain("total items:");
    expect(description).toContain("type:");
  });

  it("should build description for treasure without items", () => {
    const section: DebugTreasuresSection = createSection();

    treasureConfig.TREASURES.set("test_empty_treasure", {
      checked: false,
      empty: null,
      given: false,
      items: new LuaTable(),
      itemsToFindRemain: 0,
      refreshing: null,
      type: ETreasureType.COMMON,
    });

    const description: string = section.getTreasureDescription("test_empty_treasure");

    expect(description).toContain("total items: 0");

    treasureConfig.TREASURES.delete("test_empty_treasure");
  });

  it("should update selected treasure on list selection", () => {
    const section: DebugTreasuresSection = createSection();
    const firstSection: TSection = getFirstTreasureSection();

    section.uiTreasuresList.RemoveAll();
    section.uiTreasuresList.AddTextItem(firstSection);
    section.uiTreasuresList.SetSelectedIndex(0);

    section.onSelectedTreasureChange();

    expect(section.currentSection).toBe(firstSection);
    expect(section.uiTreasureInfoLabel.TextControl().SetText).toHaveBeenCalledWith(
      section.getTreasureDescription(firstSection)
    );
  });

  it("should re-initialize state on filter change", () => {
    const section: DebugTreasuresSection = createSection();

    jest.spyOn(section.uiTreasuresListEditBox, "GetText").mockImplementation(() => "filter-value");
    jest.spyOn(section, "initializeState");

    section.currentSection = "some_treasure";
    section.onSelectedTreasureFilterChange();

    expect(section.currentSection).toBeNull();
    expect(section.currentFilter).toBe("filter-value");
    expect(section.initializeState).toHaveBeenCalledTimes(1);
  });

  it("should not give treasures when game is not started", () => {
    const section: DebugTreasuresSection = createSection();
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorAllTreasureCoordinates").mockImplementation(jest.fn());
    jest.spyOn(treasureManager, "giveActorRandomTreasureCoordinates").mockImplementation(jest.fn());
    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    section.currentSection = "some_treasure";

    section.onGiveAllTreasuresButtonClicked();
    section.onGiveRandomTreasuresButtonClicked();
    section.onGiveSpecificTreasureButtonClicked();

    expect(treasureManager.giveActorAllTreasureCoordinates).not.toHaveBeenCalled();
    expect(treasureManager.giveActorRandomTreasureCoordinates).not.toHaveBeenCalled();
    expect(treasureManager.giveActorTreasureCoordinates).not.toHaveBeenCalled();
  });

  it("should give treasures when game is started", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTreasuresSection = createSection();
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorAllTreasureCoordinates").mockImplementation(jest.fn());
    jest.spyOn(treasureManager, "giveActorRandomTreasureCoordinates").mockImplementation(jest.fn());
    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    section.onGiveAllTreasuresButtonClicked();
    section.onGiveRandomTreasuresButtonClicked();
    section.onGiveSpecificTreasureButtonClicked();

    expect(treasureManager.giveActorAllTreasureCoordinates).toHaveBeenCalledTimes(1);
    expect(treasureManager.giveActorRandomTreasureCoordinates).toHaveBeenCalledTimes(1);
    expect(treasureManager.giveActorTreasureCoordinates).not.toHaveBeenCalled();

    section.currentSection = "some_treasure";
    section.onGiveSpecificTreasureButtonClicked();

    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("some_treasure");
  });

  it("should not teleport when game is not started or nothing is selected", () => {
    const section: DebugTreasuresSection = createSection();

    section.onTeleportToTreasureClicked();

    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    section.currentSection = null;
    section.onTeleportToTreasureClicked();

    expect(game.jump_to_level).not.toHaveBeenCalled();
  });

  it("should not teleport to treasure without registered restrictor", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTreasuresSection = createSection();

    section.currentSection = "not_registered_treasure";
    section.onTeleportToTreasureClicked();

    expect(game.jump_to_level).not.toHaveBeenCalled();
    expect(registry.actor.set_actor_position).not.toHaveBeenCalled();
  });

  it("should teleport to treasure on the same level", () => {
    const { actorGameObject } = mockRegisteredActor();
    const restrictor: ServerObject = {
      id: 4001,
      m_game_vertex_id: 101,
      m_level_vertex_id: 255,
      position: MockVector.create(4, 5, 6),
    } as unknown as ServerObject;

    MockAlifeSimulator.addToRegistry(restrictor as never);
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTreasuresSection = createSection();
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.treasuresRestrictorByName.set("registered_treasure", restrictor.id);
    replaceFunctionMock(level.name, () => "zaton");

    section.currentSection = "registered_treasure";
    section.onTeleportToTreasureClicked();

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(restrictor.position);
    expect(game.jump_to_level).not.toHaveBeenCalled();
  });
});
