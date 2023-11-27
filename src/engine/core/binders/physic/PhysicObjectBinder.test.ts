import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level, particles_object } from "xray16";

import { PhysicObjectItemBox } from "@/engine/core/binders";
import { PhysicObjectBinder } from "@/engine/core/binders/physic/PhysicObjectBinder";
import { ILogicsOverrides, IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeEvent } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockGameObject,
  mockIniFile,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
  mockServerAlifeObject,
} from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_event", () => ({
  emitSchemeEvent: jest.fn(),
}));

describe("PhysicObjectBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly handle going online/offline with defaults", () => {
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const soundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    jest.spyOn(soundManager, "stopSoundByObjectId").mockImplementation(jest.fn());

    binder.net_spawn(mockServerAlifeObject({ id: binder.object.id() }));

    const state: IRegistryObjectState = registry.objects.get(binder.object.id());

    expect(state).not.toBeNull();
    expect(binder.itemBox).toBeNull();

    binder.reinit();

    expect(registry.objects.get(binder.object.id())).not.toBe(state);
    expect(registry.objects.get(binder.object.id())).toEqual(state);

    binder.net_destroy();

    expect(registry.objects.has(binder.object.id())).toBe(false);
    expect(soundManager.stopSoundByObjectId).toHaveBeenCalledWith(binder.object.id());
  });

  it("should correctly handle with extended config", () => {
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const soundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    jest.spyOn(soundManager, "stopSoundByObjectId").mockImplementation(jest.fn());
    jest.spyOn(binder.object, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        drop_box: {
          a: 1,
        },
        level_spot: {
          actor_box: true,
        },
      });
    });

    binder.net_spawn(mockServerAlifeObject({ id: binder.object.id() }));

    const state: IRegistryObjectState = registry.objects.get(binder.object.id());

    expect(binder.itemBox).toBeInstanceOf(PhysicObjectItemBox);
    expect(level.map_add_object_spot).toHaveBeenCalledWith(
      binder.object.id(),
      "ui_pda2_actor_box_location",
      "st_ui_pda_actor_box"
    );

    jest.spyOn(level, "map_has_object_spot").mockImplementationOnce(() => 1);

    state.activeScheme = EScheme.ANIMPOINT;
    state.overrides = { onOffline: parseConditionsList("%+test_info_pb% test") } as ILogicsOverrides;
    binder.particle = { stop: jest.fn() } as unknown as particles_object;
    state[EScheme.ANIMPOINT] = mockSchemeState(EScheme.ANIMPOINT);

    binder.net_destroy();

    expect(registry.objects.has(binder.object.id())).toBe(false);
    expect(soundManager.stopSoundByObjectId).toHaveBeenCalledWith(binder.object.id());
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(binder.object.id(), "ui_pda2_actor_box_location");
    expect(binder.particle.stop).toHaveBeenCalled();

    expect(emitSchemeEvent).toHaveBeenCalledWith(
      binder.object,
      state[EScheme.ANIMPOINT],
      ESchemeEvent.SWITCH_OFFLINE,
      binder.object
    );
    expect(hasInfoPortion("test_info_pb")).toBe(true);
  });

  it.todo("should correctly handle update events");

  it("should be save relevant", () => {
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load", () => {
    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const binderState: IRegistryObjectState = registerObject(binder.object);

    binderState.jobIni = "test.ltx";
    binderState.iniFilename = "test_filename.ltx";
    binderState.sectionLogic = "logic";
    binderState.activeSection = "test@test";
    binderState.smartTerrainName = "test-smart";

    binder.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
      "save_from_PhysicObjectBinder",
      "test.ltx",
      "test_filename.ltx",
      "logic",
      "test@test",
      "test-smart",
      -5000,
      255,
      0,
      8,
      10,
    ]);

    const newBinder: PhysicObjectBinder = new PhysicObjectBinder(MockGameObject.mock());
    const newBinderState: IRegistryObjectState = registerObject(newBinder.object);

    newBinder.load(mockNetReader(netProcessor));

    expect(newBinder.isLoaded).toBe(true);
    expect(newBinder.isInitialized).toBe(false);
    expect(newBinderState.jobIni).toBe("test.ltx");
    expect(newBinderState.loadedSectionLogic).toBe("logic");
    expect(newBinderState.loadedActiveSection).toBe("test@test");
    expect(newBinderState.loadedSmartTerrainName).toBe("test-smart");
    expect(newBinderState.loadedIniFilename).toBe("test_filename.ltx");

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it.todo("should correctly handle hit events");

  it.todo("should correctly handle death events");

  it.todo("should correctly handle use events");

  it.todo("should correctly handle death events");
});
