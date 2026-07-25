import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd } from "xray16";
import { MockAlifeSimulator, MockCUIScriptWnd } from "xray16/mocks";

import { getManager, registry } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { DebugTaskSection } from "@/engine/core/ui/debug/sections/DebugTaskSection";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugTaskSection {
  const section: DebugTaskSection = new DebugTaskSection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

describe("DebugTaskSection", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = new CUIScriptWnd();
    const section: DebugTaskSection = new DebugTaskSection(owner, "test");

    expect(section.owner).toBe(owner);
    expect(section.filterIsActive).toBe(false);
  });

  it("should not fill task list when game is not started", () => {
    const section: DebugTaskSection = createSection();

    expect(section.uiTaskFilterActive.SetCheck).toHaveBeenCalledWith(false);
    expect(section.uiTaskList.AddTextItem).not.toHaveBeenCalled();
    expect(section.uiTaskCountLabel.SetText).not.toHaveBeenCalled();
  });

  it("should fill task list when game is started", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTaskSection = createSection();

    expect(section.uiTaskList.Clear).toHaveBeenCalledTimes(1);
    expect(section.uiTaskList.AddTextItem).toHaveBeenCalled();
    expect(section.uiTaskCountLabel.SetText).toHaveBeenCalledWith(
      `Total: ${jest.mocked(section.uiTaskList.AddTextItem).mock.calls.length}`
    );
  });

  it("should filter out inactive tasks", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    jest.spyOn(getManager(TaskManager), "isTaskActive").mockImplementation(() => false);

    const section: DebugTaskSection = createSection();

    jest.mocked(section.uiTaskList.AddTextItem).mockClear();

    section.filterIsActive = true;
    section.initializeState();

    expect(section.uiTaskList.AddTextItem).not.toHaveBeenCalled();
    expect(section.uiTaskCountLabel.SetText).toHaveBeenCalled();
  });

  it("should read selected task id from the list", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugTaskSection = createSection();

    section.uiTaskList.RemoveAll();
    section.onSelectedObjectChange();

    expect(section.selectedTaskId).toBeNull();

    section.uiTaskList.AddTextItem("test_task_sid | Test task title");
    section.uiTaskList.SetSelectedIndex(0);
    section.onSelectedObjectChange();

    expect(section.selectedTaskId).toBe("test_task_sid");
  });

  it("should give selected task only", () => {
    mockRegisteredActor();
    registry.simulator = MockAlifeSimulator.getInstance();

    const taskManager: TaskManager = getManager(TaskManager);
    const section: DebugTaskSection = createSection();

    jest.spyOn(taskManager, "giveTask").mockImplementation(jest.fn());

    section.selectedTaskId = null;
    section.onGiveTask();

    expect(taskManager.giveTask).not.toHaveBeenCalled();

    section.selectedTaskId = "test_task_sid";
    section.onGiveTask();

    expect(taskManager.giveTask).toHaveBeenCalledWith("test_task_sid");
  });

  it("should re-initialize state on filter toggle", () => {
    const section: DebugTaskSection = createSection();

    jest.spyOn(section.uiTaskFilterActive, "GetCheck").mockImplementation(() => true);
    jest.spyOn(section, "initializeState");

    section.onToggleFilterActive();

    expect(section.filterIsActive).toBe(true);
    expect(section.initializeState).toHaveBeenCalledTimes(1);
  });
});
