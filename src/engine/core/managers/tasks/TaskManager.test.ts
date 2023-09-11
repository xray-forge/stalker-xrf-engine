import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManagerInstance, registerActor, registry } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { TaskManager } from "@/engine/core/managers/tasks/TaskManager";
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

  it.todo("should correctly check if tasks are completed");

  it.todo("should correctly check if tasks are failed");

  it.todo("should correctly handle task updates");
});