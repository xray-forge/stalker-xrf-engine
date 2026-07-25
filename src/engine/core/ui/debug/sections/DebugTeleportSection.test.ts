import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, get_console, level } from "xray16";
import { AnyObject } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockAlifeSimulator, MockCUIScriptWnd, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { postProcessors } from "@/engine/constants/animation";
import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { DebugTeleportListEntry } from "@/engine/core/ui/debug/sections/DebugTeleportListEntry";
import { DebugTeleportSection } from "@/engine/core/ui/debug/sections/DebugTeleportSection";
import { getServerObjects } from "@/engine/core/utils/registry";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/registry", () => ({ getServerObjects: jest.fn(() => new LuaTable()) }));

// `game.jump_to_level` is not provided by `xray16` mocks, so it is stubbed per test run.
// todo: Replace with sdk update.
const jumpToLevel = jest.fn();

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugTeleportSection {
  const section: DebugTeleportSection = new DebugTeleportSection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugTeleportSection", () => {
  beforeEach(() => {
    resetRegistry();
    (game as unknown as AnyObject).jump_to_level = jumpToLevel;
    jumpToLevel.mockReset();
    resetFunctionMock(level.add_pp_effector);
    resetFunctionMock(level.name);
    resetFunctionMock(getServerObjects);
    replaceFunctionMock(getServerObjects, () => new LuaTable());
  });

  it("should correctly initialize controls and categories", () => {
    const section: DebugTeleportSection = createSection();

    expect(section.uiItemsList.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(section.uiItemListMainSize).toBeDefined();
    expect(section.uiItemListNameSize).toBeDefined();
    expect(section.uiItemListDdSize).toBeDefined();

    expect(section.uiCategoriesList.AddItem).toHaveBeenCalledWith("smart_terrain", 0);
    expect(section.uiCategoriesList.SetCurrentID).toHaveBeenCalledWith(0);
  });

  it("should fill items list with sorted smart terrains", () => {
    const first: SmartTerrain = MockSmartTerrain.mock("zat_b40_smart_terrain");
    const second: SmartTerrain = MockSmartTerrain.mock("zat_a2_smart_terrain");

    replaceFunctionMock(getServerObjects, () => $fromArray([first, second]));

    const section: DebugTeleportSection = createSection();

    expect(section.uiItemsList.RemoveAll).toHaveBeenCalled();
    expect(section.uiItemsList.AddExistingItem).toHaveBeenCalledTimes(2);
    expect(jest.mocked(section.uiItemsList.AddExistingItem).mock.calls[0][0]).toBeInstanceOf(DebugTeleportListEntry);
  });

  it("should ignore unknown categories when filling items list", () => {
    const section: DebugTeleportSection = createSection();

    jest.mocked(section.uiItemsList.RemoveAll).mockClear();
    jest.mocked(section.uiItemsList.AddExistingItem).mockClear();

    section.fillItemsList("not-existing-category" as never);

    expect(section.uiItemsList.RemoveAll).toHaveBeenCalledTimes(1);
    expect(section.uiItemsList.AddExistingItem).not.toHaveBeenCalled();
  });

  it("should refill items list on category change", () => {
    const section: DebugTeleportSection = createSection();

    jest.spyOn(section, "fillItemsList");
    jest.spyOn(section.uiCategoriesList, "GetText").mockImplementation(() => "smart_terrain");

    section.onCategoryChange();

    expect(section.fillItemsList).toHaveBeenCalledWith("smart_terrain");
  });

  it("should normalize smart terrain caption suffix in list entries", () => {
    const section: DebugTeleportSection = createSection();
    const terrain: SmartTerrain = MockSmartTerrain.mock("zat_b40_smart_terrain");

    section.addSmartTerrainToList(terrain);

    const entry: DebugTeleportListEntry = jest.mocked(section.uiItemsList.AddExistingItem).mock
      .calls[0][0] as DebugTeleportListEntry;

    expect(entry.gvid).toBe(terrain.m_game_vertex_id);
    expect(entry.lvid).toBe(terrain.m_level_vertex_id);
    expect(entry.position).toBe(terrain.position);
    expect(entry.SetWndSize).toHaveBeenCalledWith(section.uiItemListMainSize);
    expect(entry.uiInnerNameText.SetWndSize).toHaveBeenCalledWith(section.uiItemListNameSize);
    expect(entry.uiInnerSectionText.SetWndSize).toHaveBeenCalledWith(section.uiItemListDdSize);
  });

  it("should not teleport when game is not started", () => {
    const section: DebugTeleportSection = createSection();

    section.onTeleport();

    expect(level.add_pp_effector).not.toHaveBeenCalled();
    expect(jumpToLevel).not.toHaveBeenCalled();
  });

  it("should not teleport without selected item", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTeleportSection = createSection();

    section.uiItemsList.RemoveAll();
    section.onTeleport();

    expect(level.add_pp_effector).not.toHaveBeenCalled();
    expect(jumpToLevel).not.toHaveBeenCalled();
  });

  it("should teleport to selected item on the same level", () => {
    const { actorGameObject } = mockRegisteredActor();

    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(level.name, () => "zaton");

    const section: DebugTeleportSection = createSection();
    const entry: DebugTeleportListEntry = new DebugTeleportListEntry(
      24,
      120,
      "label",
      "caption",
      MockVector.create(7, 8, 9),
      255,
      101
    );

    section.uiItemsList.RemoveAll();
    section.uiItemsList.AddExistingItem(entry);
    section.uiItemsList.SetSelectedIndex(0);

    section.onTeleport();

    expect(level.add_pp_effector).toHaveBeenCalledWith(postProcessors.teleport, 2006, false);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(entry.position);
    expect(jumpToLevel).not.toHaveBeenCalled();
  });

  it("should jump to another level and close menu when teleporting instantly", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();
    replaceFunctionMock(level.name, () => "zaton");

    const section: DebugTeleportSection = createSection();
    const entry: DebugTeleportListEntry = new DebugTeleportListEntry(
      24,
      120,
      "label",
      "caption",
      MockVector.create(7, 8, 9),
      255,
      201
    );

    jest.spyOn(EventsManager, "emitEvent").mockImplementation(jest.fn());

    section.uiItemsList.RemoveAll();
    section.uiItemsList.AddExistingItem(entry);
    section.uiItemsList.SetSelectedIndex(0);

    section.onTeleport(true);

    expect(jumpToLevel).toHaveBeenCalledWith(entry.position, entry.lvid, entry.gvid);
    expect(get_console().execute).toHaveBeenCalledWith("main_menu off");
    expect(EventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.MAIN_MENU_OFF);
  });
});
