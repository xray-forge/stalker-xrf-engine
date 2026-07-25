import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameTask, ServerObject } from "xray16/alias";
import { AnyObject, TNumberId } from "xray16/lib";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getManager, registerActor, registerSimulator, registry } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { TASK_MANAGER_CONFIG_LTX } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState, ETaskStatus } from "@/engine/core/managers/tasks/types";
import { addGuiderSpot, removeGuiderSpot } from "@/engine/core/managers/tasks/utils/tasks_generic";
import { resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/managers/tasks/utils/tasks_generic", () => ({
  ...jest.requireActual<AnyObject>("@/engine/core/managers/tasks/utils/tasks_generic"),
  addGuiderSpot: jest.fn(),
  removeGuiderSpot: jest.fn(),
}));

describe("TaskObject update and lifecycle", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    registerActor(MockGameObject.mock());

    // Condlists of the sample tasks resolve through registered externs, which the registry reset drops.
    require("@/engine/scripts/declarations/tasks");
    require("@/engine/scripts/declarations/conditions");

    resetFunctionMock(addGuiderSpot);
    resetFunctionMock(removeGuiderSpot);
  });

  it("update should re-read the task from the actor when it is not linked yet", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const gameTask: GameTask = { get_id: () => "hide_from_surge" } as GameTask;

    taskObject.task = null;
    taskObject.nextUpdateAt = 0;

    replaceFunctionMock(registry.actor.get_task, () => gameTask);

    expect(taskObject.update()).toBeNull();
    expect(taskObject.task).toBe(gameTask);
    // Timestamp is only pushed forward once an actual re-evaluation happened.
    expect(taskObject.nextUpdateAt).toBe(0);
  });

  it("update should apply a new title and notify about the change", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const manager: NotificationManager = getManager(NotificationManager);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;

    jest.spyOn(manager, "sendTaskNotification").mockImplementation(jest.fn());
    // Activation already set the title once, and the engine mock keeps a single shared jest mock per method.
    (task.set_title as jest.Mock).mockClear();

    taskObject.currentTitle = "stale_title";
    taskObject.nextUpdateAt = 0;
    (taskObject as AnyObject).isNotificationOnUpdateMuted = false;

    taskObject.update();

    expect(task.set_title).toHaveBeenCalledTimes(1);
    expect(manager.sendTaskNotification).toHaveBeenCalledWith(ETaskState.UPDATED, task);
  });

  it("update should stay silent about changes for muted tasks", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const manager: NotificationManager = getManager(NotificationManager);

    taskObject.onActivate();

    jest.spyOn(manager, "sendTaskNotification").mockImplementation(jest.fn());

    taskObject.currentTitle = "stale_title";
    taskObject.nextUpdateAt = 0;
    (taskObject as AnyObject).isNotificationOnUpdateMuted = true;

    taskObject.update();

    expect(manager.sendTaskNotification).toHaveBeenCalledTimes(0);
  });

  it("update should add a map spot when the task gains a target", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;
    const nextTargetId: TNumberId = 640;

    jest.spyOn(taskObject, "updateLevelDirection").mockImplementation(jest.fn());

    taskObject.currentTargetId = null;
    taskObject.nextUpdateAt = 0;
    taskObject.targetGetterFunctorName = "test_target_functor";

    const functors: AnyObject = (globalThis as AnyObject).task_functors as AnyObject;

    functors.test_target_functor = (): TNumberId => nextTargetId;

    try {
      taskObject.update();

      expect(taskObject.currentTargetId).toBe(nextTargetId);
      expect(task.change_map_location).toHaveBeenCalledWith(taskObject.spot, nextTargetId);
      expect(level.map_add_object_spot).toHaveBeenCalledWith(nextTargetId, "ui_storyline_task_blink", "");
    } finally {
      delete functors.test_target_functor;
    }
  });

  it("update should drop map locations when the target disappears", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;

    jest.spyOn(task, "remove_map_locations");
    jest.spyOn(taskObject, "updateLevelDirection").mockImplementation(jest.fn());

    taskObject.currentTargetId = 500;
    taskObject.nextUpdateAt = 0;
    // The default surge task functor resolves to no target.
    taskObject.update();

    expect(task.remove_map_locations).toHaveBeenCalledWith(false);
    expect(taskObject.currentTargetId).toBeNull();
  });

  it("update should relocate the map spot when the target changes", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;
    const nextTargetId: TNumberId = 700;

    jest.spyOn(task, "change_map_location");
    jest.spyOn(taskObject, "updateLevelDirection").mockImplementation(jest.fn());
    jest.spyOn(taskObject, "update");

    taskObject.currentTargetId = 500;
    taskObject.nextUpdateAt = 0;
    taskObject.targetGetterFunctorName = "test_target_functor";

    const functors: AnyObject = (globalThis as AnyObject).task_functors as AnyObject;

    functors.test_target_functor = (): TNumberId => nextTargetId;

    try {
      taskObject.update();

      expect(taskObject.currentTargetId).toBe(nextTargetId);
      expect(task.change_map_location).toHaveBeenCalledWith(taskObject.spot, nextTargetId);
      expect(level.map_add_object_spot).toHaveBeenCalledWith(nextTargetId, "ui_storyline_task_blink", "");
    } finally {
      delete functors.test_target_functor;
    }
  });

  it("updateLevelDirection should remove the guider spot on the same level", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const target: ServerObject = MockAlifeHumanStalker.mock();

    taskObject.onActivate();

    replaceFunctionMock(registry.actor.is_active_task, () => true);
    replaceFunctionMock(level.name, () => "zaton");
    registry.cache.gameVertexLevelIds.set(target.m_game_vertex_id, 1);

    jest.spyOn(registry.simulator, "level_name").mockImplementation(() => "zaton");

    taskObject.updateLevelDirection(target.id);

    expect(removeGuiderSpot).toHaveBeenCalledWith("zaton");
    expect(addGuiderSpot).toHaveBeenCalledTimes(0);
  });

  it("updateLevelDirection should add the guider spot for another level", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const target: ServerObject = MockAlifeHumanStalker.mock();

    taskObject.onActivate();

    replaceFunctionMock(registry.actor.is_active_task, () => true);
    replaceFunctionMock(level.name, () => "pripyat");
    registry.cache.gameVertexLevelIds.set(target.m_game_vertex_id, 1);

    jest.spyOn(registry.simulator, "level_name").mockImplementation(() => "zaton");

    taskObject.updateLevelDirection(target.id);

    expect(addGuiderSpot).toHaveBeenCalledWith("pripyat", "zaton", taskObject.isStorylineTask);
    expect(removeGuiderSpot).toHaveBeenCalledTimes(0);
  });

  it("updateLevelDirection should ignore targets that no longer exist", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    replaceFunctionMock(registry.actor.is_active_task, () => true);

    taskObject.updateLevelDirection(9_999);

    expect(addGuiderSpot).toHaveBeenCalledTimes(0);
    expect(removeGuiderSpot).toHaveBeenCalledTimes(0);
  });

  it("reverse should mark the task as reversed and report it as failed", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();
    taskObject.reverse();

    expect(taskObject.state).toBe(ETaskState.REVERSED);

    taskObject.nextUpdateAt = Infinity;

    expect(taskObject.isFailed()).toBe(true);
    expect(taskObject.isCompleted()).toBe(false);
  });

  it("onDeactivate should notify and reset state for reversed tasks", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const manager: NotificationManager = getManager(NotificationManager);

    taskObject.onActivate();

    jest.spyOn(manager, "sendTaskNotification").mockImplementation(jest.fn());

    taskObject.state = ETaskState.REVERSED;
    taskObject.onDeactivate(taskObject.task as GameTask);

    expect(manager.sendTaskNotification).toHaveBeenCalledWith(ETaskState.REVERSED, taskObject.task);
    expect(taskObject.state).toBeNull();
    expect(taskObject.status).toBe(ETaskStatus.NORMAL);
  });

  it("onDeactivate should be inert for tasks without a resolved state", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const manager: NotificationManager = getManager(NotificationManager);

    taskObject.onActivate();

    jest.spyOn(manager, "sendTaskNotification").mockImplementation(jest.fn());

    taskObject.state = null;
    taskObject.onDeactivate(taskObject.task as GameTask);

    expect(manager.sendTaskNotification).toHaveBeenCalledTimes(0);
    expect(taskObject.status).toBe(ETaskStatus.NORMAL);
  });
});
