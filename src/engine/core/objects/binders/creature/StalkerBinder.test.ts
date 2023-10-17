import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { TradeManager } from "@/engine/core/managers/trade";
import { StalkerBinder } from "@/engine/core/objects/binders";
import { GameObject } from "@/engine/lib/types";
import {
  EPacketDataType,
  MockCTime,
  mockGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
} from "@/fixtures/xray";

describe("StalkerBinder class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
    registry.objects = new LuaTable();
  });

  it.todo("should correctly initialize");

  it.todo("should correctly initialize info portions");

  it.todo("should correctly initialize/reset callbacks");

  it.todo("should correctly handle going online/offline");

  it.todo("should correctly handle update event");

  it("should correctly handle save/load", () => {
    const tradeManager: TradeManager = TradeManager.getInstance();
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();
    const dialogManager: DialogManager = DialogManager.getInstance();

    jest.spyOn(tradeManager, "saveObjectState").mockImplementation(jest.fn());
    jest.spyOn(tradeManager, "loadObjectState").mockImplementation(jest.fn());
    jest.spyOn(globalSoundManager, "saveObject").mockImplementation(jest.fn());
    jest.spyOn(globalSoundManager, "loadObject").mockImplementation(jest.fn());
    jest.spyOn(dialogManager, "saveObjectDialogs").mockImplementation(jest.fn());
    jest.spyOn(dialogManager, "loadObjectDialogs").mockImplementation(jest.fn());

    jest.spyOn(Date, "now").mockImplementationOnce(() => 7000);

    const object: GameObject = mockGameObject();
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

    binder.save(mockNetPacket(netProcessor));

    expect(tradeManager.saveObjectState).toHaveBeenCalledWith(netProcessor, object);
    expect(globalSoundManager.saveObject).toHaveBeenCalledWith(netProcessor, object);
    expect(dialogManager.saveObjectDialogs).toHaveBeenCalledWith(netProcessor, object);

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

    binder.load(mockNetReader(netProcessor));

    expect(tradeManager.loadObjectState).toHaveBeenCalledWith(netProcessor, object);
    expect(globalSoundManager.loadObject).toHaveBeenCalledWith(netProcessor, object);
    expect(dialogManager.loadObjectDialogs).toHaveBeenCalledWith(netProcessor, object);

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
