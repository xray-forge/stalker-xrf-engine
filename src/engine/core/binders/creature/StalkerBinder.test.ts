import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { getManager, IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { SoundManager } from "@/engine/core/managers/sounds";
import { initializeObjectThemes } from "@/engine/core/managers/sounds/utils";
import { TradeManager } from "@/engine/core/managers/trade";
import { SchemePostCombatIdle } from "@/engine/core/schemes/stalker/combat_idle";
import { SchemeReachTask } from "@/engine/core/schemes/stalker/reach_task";
import {
  setupObjectInfoPortions,
  setupObjectStalkerVisual,
  syncSpawnedObjectPosition,
} from "@/engine/core/utils/object";
import { setupObjectSmartJobsAndLogicOnSpawn } from "@/engine/core/utils/scheme";
import { ESchemeType, GameObject, ServerHumanObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { EPacketDataType, MockAlifeHumanStalker, MockCTime, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/object");

jest.mock("@/engine/core/managers/sounds/utils");

jest.mock("@/engine/core/utils/scheme", () => ({
  setupObjectSmartJobsAndLogicOnSpawn: jest.fn(),
}));

describe("StalkerBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    resetFunctionMock(setupObjectSmartJobsAndLogicOnSpawn);
    resetFunctionMock(syncSpawnedObjectPosition);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly initialize info portions");

  it.todo("should correctly initialize/reset callbacks");

  it("should correctly handle going online/offline", () => {
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: StalkerBinder = new StalkerBinder(object);

    jest.spyOn(SchemeReachTask, "setup").mockImplementation(jest.fn());
    jest.spyOn(SchemePostCombatIdle, "setup").mockImplementation(jest.fn());

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.stalkers.length()).toBe(1);
    expect(registry.helicopter.enemies.length()).toBe(1);

    expect(binder.helicopterEnemyIndex).toBe(0);

    expect(object.set_callback).toBe;

    expect(setupObjectStalkerVisual).toHaveBeenCalledTimes(1);
    expect(setupObjectInfoPortions).toHaveBeenCalledTimes(1);
    expect(setupObjectSmartJobsAndLogicOnSpawn).toHaveBeenCalledWith(object, binder.state, ESchemeType.STALKER, false);
    expect(initializeObjectThemes).toHaveBeenCalledWith(object);
    expect(SchemeReachTask.setup).toHaveBeenCalledWith(object);
    expect(SchemePostCombatIdle.setup).toHaveBeenCalledWith(object);
    expect(object.group_throw_time_interval).toHaveBeenCalledWith(2000);
    expect(object.apply_loophole_direction_distance).toHaveBeenCalledWith(1);

    expect(syncSpawnedObjectPosition).toHaveBeenCalledTimes(1);
    expect(syncSpawnedObjectPosition).toHaveBeenCalledWith(object, serverObject.m_smart_terrain_id);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.stalkers.length()).toBe(0);
  });

  it.todo("should correctly handle going online/offline when spawn check is falsy");

  it.todo("should correctly handle update event");

  it("should correctly handle save/load", () => {
    const tradeManager: TradeManager = getManager(TradeManager);
    const soundManager: SoundManager = getManager(SoundManager);
    const dialogManager: DialogManager = getManager(DialogManager);

    jest.spyOn(tradeManager, "saveObjectState").mockImplementation(jest.fn());
    jest.spyOn(tradeManager, "loadObjectState").mockImplementation(jest.fn());
    jest.spyOn(soundManager, "saveObject").mockImplementation(jest.fn());
    jest.spyOn(soundManager, "loadObject").mockImplementation(jest.fn());
    jest.spyOn(dialogManager, "saveObjectDialogs").mockImplementation(jest.fn());
    jest.spyOn(dialogManager, "loadObjectDialogs").mockImplementation(jest.fn());

    jest.spyOn(Date, "now").mockImplementationOnce(() => 7000);

    const object: GameObject = MockGameObject.mock();
    const binder: StalkerBinder = new StalkerBinder(object);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    registerObject(object);

    binder.reinit();

    const state: IRegistryObjectState = registry.objects.get(object.id());

    state.activationTime = 5000;
    state.activationGameTime = MockCTime.mock(2012, 6, 12, 20, 15, 30, 500);
    state.jobIni = "job_ini.ltx";
    state.iniFilename = "ini.ltx";
    state.sectionLogic = "logic";
    state.activeSection = "scheme@section";
    state.smartTerrainName = "some_smart";

    binder.save(netProcessor.asNetPacket());

    expect(tradeManager.saveObjectState).toHaveBeenCalledWith(object, netProcessor);
    expect(soundManager.saveObject).toHaveBeenCalledWith(object, netProcessor);
    expect(dialogManager.saveObjectDialogs).toHaveBeenCalledWith(object, netProcessor);

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      "save_from_StalkerBinder",
      "job_ini.ltx",
      "ini.ltx",
      "logic",
      "scheme@section",
      "some_smart",
      -2000,
      12,
      6,
      12,
      20,
      15,
      30,
      500,
      0,
      14,
      16,
    ]);

    binder.load(netProcessor.asNetReader());

    expect(tradeManager.loadObjectState).toHaveBeenCalledWith(object, netProcessor);
    expect(soundManager.loadObject).toHaveBeenCalledWith(object, netProcessor);
    expect(dialogManager.loadObjectDialogs).toHaveBeenCalledWith(object, netProcessor);

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it.todo("should correctly handle death event");

  it.todo("should correctly handle hit event");

  it.todo("should correctly handle hear event");

  it.todo("should correctly handle use event");

  it.todo("should correctly handle patrol event");

  it.todo("should correctly update torch light state");
});
