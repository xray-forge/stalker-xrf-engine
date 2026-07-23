import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { CTime, level, time_global } from "xray16";
import { GameTask } from "xray16/alias";
import { NIL } from "xray16/lib";
import { EMockPacketDataType, MockGameObject, MockNetProcessor } from "xray16/mocks";

import { disposeManager, registerActor, registry } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { TASK_MANAGER_CONFIG_LTX, taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskManager } from "@/engine/core/managers/tasks/TaskManager";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState, ETaskStatus } from "@/engine/core/managers/tasks/types";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

describe("TaskObject", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks");
    registerActor(MockGameObject.mock());
  });

  it("should correctly initialize", () => {
    const sampleTaskId: string = "zat_b28_heli_3_crash";
    const taskObject: TaskObject = new TaskObject(sampleTaskId, TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    expect(registry.actor.give_task).toHaveBeenCalledTimes(1);

    expect(taskObject.id).toBe(sampleTaskId);
    expect(taskObject.status).toBe(ETaskStatus.SELECTED);
    expect(taskObject.state).toBeNull();
    expect(taskObject.title).toBe("zat_b28_heli_3_crash_name");
    expect(taskObject.target).toBe("zat_b28_heli_3");
    expect(taskObject.spot).toBe("storyline_task_location");
    expect(taskObject.titleGetterFunctorName).toBe("condlist");
    expect(taskObject.isStorylineTask).toBe(true);
    expect(taskObject.isNotificationOnUpdateMuted).toBe(false);
    expect(taskObject.initializedAt).toBeInstanceOf(CTime);
    expect(taskObject.nextUpdateAt).toBe(0);
    expect(taskObject.onInit).toEqual(parseConditionsList(""));
    expect(taskObject.onComplete).toEqual(parseConditionsList(""));
    expect(taskObject.onReversed).toEqual(parseConditionsList(""));
    expect(taskObject.rewardItemsConditionList).toEqual(parseConditionsList(""));
    expect(taskObject.rewardMoneyConditionList).toEqual(parseConditionsList(""));

    expect(table.size(taskObject.conditionLists)).toBe(1);
    expect(taskObject.conditionLists.get(0)).toEqual(parseConditionsList("{+zat_b28_heli_3_searched} complete"));

    expect(taskObject.task).toBeDefined();
    expect(taskObject.task?.get_id()).toBe(sampleTaskId);
    expect(taskObject.task?.get_priority()).toBe(103);
    expect(taskObject.task?.get_title()).toBe("zat_b28_heli_3_crash_name");
    expect(taskObject.task?.get_description()).toBe("zat_b28_heli_3_crash_text");
    expect(taskObject.task?.get_icon_name()).toBe("ui_inGame2_Skat_3");
    expect(taskObject.task?.add_complete_func).toHaveBeenCalledWith("engine.is_task_completed");
    expect(taskObject.task?.add_fail_func).toHaveBeenCalledWith("engine.is_task_failed");
  });

  it("should correctly load and save data", () => {
    const sampleTaskId: string = "hide_from_surge";
    const taskObject: TaskObject = new TaskObject(sampleTaskId, TASK_MANAGER_CONFIG_LTX);
    const processor: MockNetProcessor = new MockNetProcessor();

    taskObject.onActivate();
    taskObject.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U8,
      EMockPacketDataType.U16,
      EMockPacketDataType.STRING,
      EMockPacketDataType.STRING,
      EMockPacketDataType.STRING,
      EMockPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      2,
      12,
      6,
      12,
      9,
      30,
      0,
      0,
      "hide_from_surge_name_1",
      "translated_hide_from_surge_descr_1_a",
      NIL,
      11,
    ]);

    disposeManager(TaskManager);

    const newTaskObject: TaskObject = new TaskObject(sampleTaskId, TASK_MANAGER_CONFIG_LTX);

    newTaskObject.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it("should refresh the task description on update when the description functor value changes", () => {
    const taskObject: TaskObject = new TaskObject("zat_b28_heli_3_crash", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;
    const setDescriptionSpy = jest.spyOn(task, "set_description");

    // Force a stale current description so update() recomputes and applies the fresh one.
    taskObject.currentDescription = "stale_description";
    setDescriptionSpy.mockClear();
    taskObject.update();

    expect(taskObject.currentDescription).not.toBe("stale_description");
    expect(setDescriptionSpy).toHaveBeenCalledTimes(1);
  });

  it("should throttle updates while within the update window", () => {
    const taskObject: TaskObject = new TaskObject("zat_b28_heli_3_crash", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;
    const setTitleSpy = jest.spyOn(task, "set_title");

    // A determined state with a future next-update timestamp: update() must skip the re-evaluation entirely.
    const future: number = time_global() + taskConfig.UPDATE_CHECK_PERIOD_MIN;

    taskObject.state = ETaskState.NEW;
    taskObject.nextUpdateAt = future;
    setTitleSpy.mockClear();

    expect(taskObject.update()).toBe(ETaskState.NEW);
    // Throttled: nextUpdateAt is left untouched (a non-throttled run would overwrite it with now + period).
    expect(taskObject.nextUpdateAt).toBe(future);
    expect(setTitleSpy).not.toHaveBeenCalled();
  });

  it("should throttle updates for in-progress tasks without determined state", () => {
    const taskObject: TaskObject = new TaskObject("zat_b28_heli_3_crash", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const task: GameTask = taskObject.task as GameTask;
    const setTitleSpy = jest.spyOn(task, "set_title");
    const future: number = time_global() + taskConfig.UPDATE_CHECK_PERIOD_MIN;

    taskObject.state = null;
    taskObject.nextUpdateAt = future;
    setTitleSpy.mockClear();

    expect(taskObject.update()).toBeNull();
    expect(taskObject.nextUpdateAt).toBe(future);
    expect(setTitleSpy).not.toHaveBeenCalled();
  });

  it("should schedule next update with randomized period after re-evaluation", () => {
    const taskObject: TaskObject = new TaskObject("zat_b28_heli_3_crash", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    const now: number = time_global();

    taskObject.nextUpdateAt = 0;
    taskObject.update();

    expect(taskObject.nextUpdateAt).toBeGreaterThanOrEqual(now + taskConfig.UPDATE_CHECK_PERIOD_MIN);
    expect(taskObject.nextUpdateAt).toBeLessThanOrEqual(now + taskConfig.UPDATE_CHECK_PERIOD_MAX);
  });

  it("should give a configured task to the actor on activation", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();

    expect(taskObject.task?.get_id()).toBe("hide_from_surge");
    expect(taskObject.status).toBe(ETaskStatus.SELECTED);
    expect(registry.actor.give_task).toHaveBeenCalledWith(taskObject.task, 0, false, 0);
  });

  it("should calculate a completed state from the configured condition list", () => {
    const taskObject: TaskObject = new TaskObject("zat_b28_heli_3_crash", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();
    giveInfoPortion("zat_b28_heli_3_searched");
    taskObject.nextUpdateAt = 0;

    expect(taskObject.update()).toBe(ETaskState.COMPLETED);
  });

  it("should leave guider spots unchanged when the task has no target", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);
    const removeMapSpot = jest.spyOn(level, "map_remove_object_spot");

    taskObject.updateLevelDirection(null);

    expect(removeMapSpot).not.toHaveBeenCalled();
  });

  it("should reset completed task state after deactivation", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();
    taskObject.state = ETaskState.COMPLETED;
    taskObject.onDeactivate(taskObject.task!);

    expect(taskObject.state).toBeNull();
    expect(taskObject.status).toBe(ETaskStatus.NORMAL);
    expect(taskObject.nextUpdateAt).toBe(0);
  });

  it("should reset failed task state after deactivation", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.onActivate();
    taskObject.state = ETaskState.FAIL;
    taskObject.onDeactivate(taskObject.task!);

    expect(taskObject.state).toBeNull();
    expect(taskObject.status).toBe(ETaskStatus.NORMAL);
  });

  it("should preserve task state when checking level direction without an active task", () => {
    const taskObject: TaskObject = new TaskObject("hide_from_surge", TASK_MANAGER_CONFIG_LTX);

    taskObject.state = ETaskState.NEW;
    taskObject.updateLevelDirection(1);

    expect(taskObject.state).toBe(ETaskState.NEW);
  });
});
