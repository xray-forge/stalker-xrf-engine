import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback } from "xray16";

import { CrowBinder } from "@/engine/core/binders/creature/CrowBinder";
import { IRegistryObjectState, registerCrow, registerSimulator, registry } from "@/engine/core/database";
import { EScheme, ESchemeType, GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockAlifeObject, MockGameObject, MockNetProcessor, MockObjectBinder } from "@/fixtures/xray";

describe("CrowBinder", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly reinit", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CrowBinder = new CrowBinder(object);

    binder.diedAt = 5000;
    expect(binder.net_spawn(MockAlifeObject.mock({ id: object.id() }))).toBe(true);

    const firstState: IRegistryObjectState = registry.objects.get(object.id());

    binder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(firstState);
    expect(binder.diedAt).toBe(0);
  });

  it("should correctly handle going online/offline", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CrowBinder = new CrowBinder(object);

    expect(binder.net_spawn(MockAlifeObject.mock({ id: object.id() }))).toBe(true);
    expect(binder.object.set_callback).toHaveBeenCalledWith(callback.death, binder.onDeath, binder);
    expect(registry.crows.count).toBe(1);
    expect(registry.crows.storage.get(object.id())).toBe(object.id());

    binder.net_destroy();

    expect(binder.object.set_callback).toHaveBeenCalledWith(callback.death, null);
    expect(registry.crows.count).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
  });

  it("should correctly handle going online/offline when spawn check is falsy", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CrowBinder = new CrowBinder(object);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    expect(binder.net_spawn(MockAlifeObject.mock({ id: object.id() }))).toBe(false);

    expect(registry.crows.count).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
  });

  it("should correctly handle update event", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject: ServerObject = MockAlifeObject.mock({ id: object.id() });
    const binder: CrowBinder = new CrowBinder(object);

    jest.spyOn(Date, "now").mockImplementation(() => 5000);
    binder.diedAt = 1;
    binder.update(0);

    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 60000);
    binder.update(0);

    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 121000);
    binder.update(0);
    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(object, "alive").mockImplementation(() => false);
    binder.update(0);
    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
  });

  it("should correctly handle update event", () => {
    const firstObject: GameObject = MockGameObject.mock();
    const firstBinder: CrowBinder = new CrowBinder(firstObject);

    expect(firstBinder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load", () => {
    const processor: MockNetProcessor = new MockNetProcessor();

    const firstObject: GameObject = MockGameObject.mock();
    const firstBinder: CrowBinder = new CrowBinder(firstObject);

    expect(firstBinder.net_spawn(MockAlifeObject.mock({ id: firstObject.id() }))).toBe(true);

    const firstState: IRegistryObjectState = registry.objects.get(firstObject.id());

    firstState.sectionLogic = "logic";
    firstState.schemeType = ESchemeType.MONSTER;
    firstState.activeScheme = EScheme.MOB_WALKER;
    firstState.activeSection = "mob_walker@test";
    firstState.smartTerrainName = "test_smart";
    firstState.jobIni = "test_job_ini.ltx";
    firstState.iniFilename = "test_ini.ltx";

    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    firstBinder.diedAt = 400;
    firstBinder.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
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
      EPacketDataType.U32,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      "save_from_CrowBinder",
      "test_job_ini.ltx",
      "test_ini.ltx",
      "logic",
      "mob_walker@test",
      "test_smart",
      -5000,
      255,
      0,
      8,
      400,
      11,
    ]);

    const secondObject: GameObject = MockGameObject.mock();
    const secondBinder: CrowBinder = new CrowBinder(secondObject);

    expect(secondBinder.net_spawn(MockAlifeObject.mock({ id: secondObject.id() }))).toBe(true);
    secondBinder.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);

    expect(secondBinder.diedAt).toBe(400);

    expect(registry.objects.get(secondObject.id())).toEqualLuaTables({
      activationGameTime: null,
      activationTime: 0,
      jobIni: "test_job_ini.ltx",
      loadedActiveSection: "mob_walker@test",
      loadedIniFilename: "test_ini.ltx",
      loadedSectionLogic: "logic",
      loadedSmartTerrainName: "test_smart",
      object: secondObject,
      portableStore: {},
    });
  });

  it("should correctly handle death event", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CrowBinder = new CrowBinder(object);

    registerCrow(object);

    binder.onDeath();

    expect(registry.objects.length()).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
    expect(registry.crows.count).toBe(0);
  });
});
