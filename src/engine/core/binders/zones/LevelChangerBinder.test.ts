import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { LevelChangerBinder } from "@/engine/core/binders/zones/LevelChangerBinder";
import { IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { LevelChanger } from "@/engine/core/objects/level";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockGameObject, MockNetProcessor, MockObjectBinder } from "@/fixtures/xray";

describe("LevelChangerBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly skip logics if spawn disabled", () => {
    const serverObject: LevelChanger = new LevelChanger("test");
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: LevelChangerBinder = new LevelChangerBinder(object);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);
    expect(registry.objects.has(object.id())).toBe(false);
  });

  it("should correctly handle online-offline events", () => {
    const serverObject: LevelChanger = new LevelChanger("test");
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: LevelChangerBinder = new LevelChangerBinder(object);

    serverObject.isEnabled = true;
    serverObject.invitationHint = "test-hint";

    binder.net_spawn(serverObject);

    expect(registry.objects.has(object.id())).toBe(true);
    expect(object.enable_level_changer).toHaveBeenCalledWith(true);
    expect(object.set_level_changer_invitation).toHaveBeenCalledWith("test-hint");

    binder.net_destroy();

    expect(registry.objects.has(object.id())).toBe(false);
  });

  it("should correctly reinit", () => {
    const serverObject: LevelChanger = new LevelChanger("test");
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: LevelChangerBinder = new LevelChangerBinder(object);

    binder.net_spawn(serverObject);

    const state: IRegistryObjectState = registry.objects.get(object.id());

    expect(registry.objects.has(object.id())).toBe(true);

    binder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(state);
    expect(registry.objects.get(object.id()).object).toBe(object);
  });

  it("should correctly handle save/load", () => {
    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: LevelChangerBinder = new LevelChangerBinder(MockGameObject.mock());
    const binderState: IRegistryObjectState = registerObject(binder.object);

    binderState.jobIni = "test.ltx";
    binderState.iniFilename = "test_filename.ltx";
    binderState.sectionLogic = "logic";
    binderState.activeSection = "test@test";
    binderState.smartTerrainName = "test-smart";

    binder.save(netProcessor.asNetPacket());

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
      "save_from_LevelChangerBinder",
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

    const newBinder: LevelChangerBinder = new LevelChangerBinder(MockGameObject.mock());
    const newBinderState: IRegistryObjectState = registerObject(newBinder.object);

    newBinder.load(netProcessor.asNetReader());

    expect(newBinderState.jobIni).toBe("test.ltx");
    expect(newBinderState.loadedSectionLogic).toBe("logic");
    expect(newBinderState.loadedActiveSection).toBe("test@test");
    expect(newBinderState.loadedSmartTerrainName).toBe("test-smart");
    expect(newBinderState.loadedIniFilename).toBe("test_filename.ltx");

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it("should be save relevant", () => {
    const binder: LevelChangerBinder = new LevelChangerBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });
});
