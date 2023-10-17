import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { callback } from "xray16";

import { IRegistryObjectState, registerCrow, registerSimulator, registry } from "@/engine/core/database";
import { CrowBinder } from "@/engine/core/objects/binders";
import { EScheme, ESchemeType, GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  mockGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetReader,
  mockServerAlifeObject,
} from "@/fixtures/xray";

describe("CrowBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly reinit", () => {
    const object: GameObject = mockGameObject();
    const crowBinder: CrowBinder = new CrowBinder(object);

    crowBinder.diedAt = 5000;
    expect(crowBinder.net_spawn(mockServerAlifeObject({ id: object.id() }))).toBe(true);

    const firstState: IRegistryObjectState = registry.objects.get(object.id());

    crowBinder.reinit();

    expect(registry.objects.get(object.id())).not.toBe(firstState);
    expect(crowBinder.diedAt).toBe(0);
  });

  it("should correctly handle going online/offline", () => {
    const object: GameObject = mockGameObject();
    const crowBinder: CrowBinder = new CrowBinder(object);

    expect(crowBinder.net_spawn(mockServerAlifeObject({ id: object.id() }))).toBe(true);
    expect(crowBinder.object.set_callback).toHaveBeenCalledWith(callback.death, crowBinder.onDeath, crowBinder);
    expect(registry.crows.count).toBe(1);
    expect(registry.crows.storage.get(object.id())).toBe(object.id());

    crowBinder.net_destroy();

    expect(crowBinder.object.set_callback).toHaveBeenCalledWith(callback.death, null);
    expect(registry.crows.count).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
  });

  it("should correctly handle update event", () => {
    const object: GameObject = mockGameObject();
    const serverObject: ServerObject = mockServerAlifeObject({ id: object.id() });
    const crowBinder: CrowBinder = new CrowBinder(object);

    jest.spyOn(Date, "now").mockImplementation(() => 5000);
    crowBinder.diedAt = 1;
    crowBinder.update(0);

    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 60000);
    crowBinder.update(0);

    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 121000);
    crowBinder.update(0);
    expect(registry.simulator.release).not.toHaveBeenCalled();

    jest.spyOn(object, "alive").mockImplementation(() => false);
    crowBinder.update(0);
    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
  });

  it("should correctly handle update event", () => {
    const firstObject: GameObject = mockGameObject();
    const firstCrowBinder: CrowBinder = new CrowBinder(firstObject);

    expect(firstCrowBinder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle save/load", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    const firstObject: GameObject = mockGameObject();
    const firstCrowBinder: CrowBinder = new CrowBinder(firstObject);

    expect(firstCrowBinder.net_spawn(mockServerAlifeObject({ id: firstObject.id() }))).toBe(true);

    const firstState: IRegistryObjectState = registry.objects.get(firstObject.id());

    firstState.sectionLogic = "logic";
    firstState.schemeType = ESchemeType.MONSTER;
    firstState.activeScheme = EScheme.MOB_WALKER;
    firstState.activeSection = "mob_walker@test";
    firstState.smartTerrainName = "test_smart";
    firstState.jobIni = "test_job_ini.ltx";
    firstState.iniFilename = "test_ini.ltx";

    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    firstCrowBinder.diedAt = 400;
    firstCrowBinder.save(mockNetPacket(netProcessor));

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
      EPacketDataType.U32,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([
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

    const secondObject: GameObject = mockGameObject();
    const secondCrowBinder: CrowBinder = new CrowBinder(secondObject);

    expect(secondCrowBinder.net_spawn(mockServerAlifeObject({ id: secondObject.id() }))).toBe(true);
    secondCrowBinder.load(mockNetReader(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(secondCrowBinder.diedAt).toBe(400);

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
    const object: GameObject = mockGameObject();
    const crowBinder: CrowBinder = new CrowBinder(object);

    registerCrow(object);

    crowBinder.onDeath();

    expect(registry.objects.length()).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
    expect(registry.crows.count).toBe(0);
  });
});
