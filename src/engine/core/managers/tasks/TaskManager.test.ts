import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { TaskManager } from "@/engine/core/managers/tasks/TaskManager";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { NIL } from "@/engine/lib/constants/words";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockClientGameObject } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("TaskManager class", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks");
    registerActor(mockClientGameObject());
  });

  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize and destroy", () => {
    const taskManager: TaskManager = getManagerInstance(TaskManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(MockLuaTable.getMockSize(taskManager.tasksList)).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(1);

    disposeManager(TaskManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
    expect(MockLuaTable.getMockSize(taskManager.tasksList)).toBe(0);
  });

  it("should correctly save and load empty list data", () => {
    const taskManager: TaskManager = getManagerInstance(TaskManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    taskManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U16, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([0, 1]);

    disposeManager(TaskManager);

    const newTaskManager: TaskManager = getManagerInstance(TaskManager);

    newTaskManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
    expect(newTaskManager).not.toBe(taskManager);
    expect(taskManager.tasksList).toEqual(newTaskManager.tasksList);
  });

  it("should correctly save and load with tasks data", () => {
    const taskManager: TaskManager = getManagerInstance(TaskManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    taskManager.giveTask("hide_from_surge");

    taskManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      1,
      "hide_from_surge",
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
      14,
    ]);

    disposeManager(TaskManager);

    const newTaskManager: TaskManager = getManagerInstance(TaskManager);

    newTaskManager.load(mockNetProcessor(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(newTaskManager).not.toBe(taskManager);
    expect(MockLuaTable.getMockSize(taskManager.tasksList)).toBe(1);
    expect(MockLuaTable.getMockSize(newTaskManager.tasksList)).toBe(1);
  });

  it.todo("should correctly give tasks");

  it("should correctly check if tasks are active", () => {
    const taskManager: TaskManager = TaskManager.getInstance();

    expect(taskManager.isTaskActive("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { state: ETaskState.COMPLETED } as TaskObject);
    expect(taskManager.isTaskActive("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { state: ETaskState.FAIL } as TaskObject);
    expect(taskManager.isTaskActive("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { state: ETaskState.REVERSED } as TaskObject);
    expect(taskManager.isTaskActive("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { state: ETaskState.NEW } as TaskObject);
    expect(taskManager.isTaskActive("test_task")).toBeTruthy();
  });

  it("should correctly check if tasks are failed", () => {
    const taskManager: TaskManager = TaskManager.getInstance();

    expect(taskManager.isTaskFailed("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.COMPLETED } as TaskObject);
    expect(taskManager.isTaskFailed("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.NEW } as TaskObject);
    expect(taskManager.isTaskFailed("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.FAIL } as TaskObject);
    expect(taskManager.isTaskFailed("test_task")).toBeTruthy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.REVERSED } as TaskObject);
    expect(taskManager.isTaskFailed("test_task")).toBeTruthy();
  });

  it("should correctly check if tasks are completed", () => {
    const taskManager: TaskManager = TaskManager.getInstance();

    expect(taskManager.isTaskCompleted("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.NEW } as TaskObject);
    expect(taskManager.isTaskCompleted("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.FAIL } as TaskObject);
    expect(taskManager.isTaskCompleted("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", { checkTaskState: () => ETaskState.REVERSED } as TaskObject);
    expect(taskManager.isTaskCompleted("test_task")).toBeFalsy();

    taskManager.tasksList.set("test_task", {
      checkTaskState: () => ETaskState.COMPLETED,
      giveTaskReward: jest.fn(),
    } as unknown as TaskObject);
    jest.spyOn(taskManager.tasksList.get("test_task"), "giveTaskReward");

    expect(taskManager.isTaskCompleted("test_task")).toBeTruthy();
    expect(taskManager.tasksList.get("test_task").giveTaskReward).toHaveBeenCalled();
  });

  it.todo("should correctly handle task updates");
});
