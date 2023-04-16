import { beforeAll, describe, expect, it } from "@jest/globals";
import { CTime } from "xray16";

import { disposeManager, registerActor, registry, TASK_MANAGER_LTX } from "@/engine/core/database";
import { ETaskStatus, TaskManager, TaskObject } from "@/engine/core/managers";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { mockClientGameObject } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("TaskObject class", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks");
    registerActor(mockClientGameObject());
  });

  it("should correctly initialize", () => {
    const sampleTaskId: string = "zat_b28_heli_3_crash";
    const taskObject: TaskObject = new TaskObject(TASK_MANAGER_LTX, sampleTaskId);

    taskObject.giveTask();

    expect(registry.actor.give_task).toHaveBeenCalledTimes(1);

    expect(taskObject.ini).toBe(TASK_MANAGER_LTX);
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
    expect(taskObject.lastCheckedAt).toBeNull();
    expect(taskObject.onInit).toEqual(parseConditionsList(""));
    expect(taskObject.onComplete).toEqual(parseConditionsList(""));
    expect(taskObject.onReversed).toEqual(parseConditionsList(""));
    expect(taskObject.rewardItemsConditionList).toEqual(parseConditionsList(""));
    expect(taskObject.rewardMoneyConditionList).toEqual(parseConditionsList(""));

    expect(MockLuaTable.getMockSize(taskObject.conditionLists)).toBe(1);
    expect(taskObject.conditionLists.get(0)).toEqual(parseConditionsList("{+zat_b28_heli_3_searched} complete"));

    expect(taskObject.gameTask).toBeDefined();
    expect(taskObject.gameTask?.get_id()).toBe(sampleTaskId);
    expect(taskObject.gameTask?.get_priority()).toBe(103);
    expect(taskObject.gameTask?.get_title()).toBe("zat_b28_heli_3_crash_name");
    expect(taskObject.gameTask?.get_description()).toBe("zat_b28_heli_3_crash_text");
    expect(taskObject.gameTask?.get_icon_name()).toBe("ui_inGame2_Skat_3");
    expect(taskObject.gameTask?.add_complete_func).toHaveBeenCalledWith("engine.is_task_completed");
    expect(taskObject.gameTask?.add_fail_func).toHaveBeenCalledWith("engine.is_task_failed");
  });

  it("should correctly load and save data", () => {
    const sampleTaskId: string = "hide_from_surge";
    const taskObject: TaskObject = new TaskObject(TASK_MANAGER_LTX, sampleTaskId);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    taskObject.giveTask();
    taskObject.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
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
    ]);
    expect(netProcessor.dataList).toEqual([
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

    const newTaskObject: TaskObject = new TaskObject(TASK_MANAGER_LTX, sampleTaskId);

    newTaskObject.load(mockNetProcessor(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
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
    ]);
    expect(netProcessor.dataList).toHaveLength(0);
  });
});
