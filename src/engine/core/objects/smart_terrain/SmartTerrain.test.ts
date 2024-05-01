import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { getManager, registerActorServer, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation";
import { Actor } from "@/engine/core/objects/creature";
import { IObjectJobState, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain/index";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { IniFile, ServerHumanObject } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import {
  EPacketDataType,
  MockAlifeCreatureActor,
  MockAlifeHumanStalker,
  MockCALifeSmartTerrainTask,
  MockCTime,
  MockIniFile,
  MockNetProcessor,
} from "@/fixtures/xray";

describe("SmartTerrain generic logic", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    registerActorServer(MockAlifeCreatureActor.mock() as Actor);
  });

  it("should correctly init default fields", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");

    expect(terrain.ini).toBeUndefined();
    expect(terrain.jobsConfig).toBeUndefined();
    expect(terrain.jobsConfigName).toBeUndefined();

    expect(terrain.squadId).toBe(0);
    expect(terrain.isOnLevel).toBe(false);
    expect(terrain.simulationRole).toBe(ESimulationTerrainRole.DEFAULT);
    expect(terrain.mapSpot).toBeNull();
    expect(terrain.respawnSector).toBeNull();
    expect(terrain.forbiddenPoint).toBe("");

    expect(terrain.isRegistered).toBe(false);
    expect(terrain.isRespawnPoint).toBe(false);
    expect(terrain.isObjectsInitializationNeeded).toBe(false);
    expect(terrain.isSimulationAvailableConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(terrain.isMutantDisabled).toBe(false);
    expect(terrain.isMutantLair).toBe(false);
    expect(terrain.isRespawnOnlySmart).toBe(false);
    expect(terrain.areCampfiresOn).toBe(false);

    expect(terrain.alarmStartedAt).toBeNull();
    expect(terrain.arrivalDistance).toBe(25);
    expect(terrain.stayingObjectsCount).toBe(0);
    expect(terrain.maxStayingSquadsCount).toBe(0);
    expect(terrain.nextCheckAt).toBe(0);
    expect(terrain.lastRespawnUpdatedAt).toBeNull();

    expect(terrain.travelerActorPointName).toBe("");
    expect(terrain.travelerSquadPointName).toBe("");

    expect(terrain.defendRestrictor).toBeNull();
    expect(terrain.attackRestrictor).toBeNull();
    expect(terrain.safeRestrictor).toBeNull();
    expect(terrain.spawnPointName).toBeNull();
    expect(terrain.terrainControl).toBeNull();

    expect(terrain.arrivingObjects.length()).toBe(0);
    expect(terrain.jobs.length()).toBe(0);
    expect(terrain.objectJobDescriptors.length()).toBe(0);
    expect(terrain.objectByJobSection.length()).toBe(0);
    expect(terrain.jobDeadTimeById.length()).toBe(0);
    expect(terrain.smartTerrainAlifeTask).toBeUndefined();

    expect(terrain.simulationManager).toBeDefined();
    expect(terrain.simulationProperties).toBeUndefined();
    expect(terrain.spawnSquadsConfiguration.length()).toBe(0);
    expect(terrain.spawnedSquadsList.length()).toBe(0);
  });

  it("should correctly emit registering lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    const onSmartTerrainRegister = jest.fn();
    const onSmartTerrainUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_REGISTER, onSmartTerrainRegister);
    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_UNREGISTER, onSmartTerrainUnregister);

    terrain.on_before_register();
    terrain.on_register();

    expect(onSmartTerrainRegister).toHaveBeenCalledWith(terrain);
    expect(onSmartTerrainUnregister).not.toHaveBeenCalled();

    terrain.on_unregister();

    expect(onSmartTerrainRegister).toHaveBeenCalledWith(terrain);
    expect(onSmartTerrainUnregister).toHaveBeenCalledWith(terrain);
  });

  it("should correctly handle before register", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    terrain.on_before_register();

    expect(terrain.simulationManager.getSmartTerrainByName(terrain.name())).toBe(terrain);
  });

  it("should correctly handle register", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");

    jest.spyOn(terrain, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        story_object: {
          story_id: "test_smart_sid",
        },
      });
    });

    terrain.ini = terrain.spawn_ini() as IniFile;

    replaceFunctionMock(time_global, () => 4000);

    terrain.on_before_register();
    terrain.on_register();

    expect(registry.storyLink.idBySid.get("test_smart_sid")).toBe(terrain.id);
    expect(registry.storyLink.sidById.get(terrain.id)).toBe("test_smart_sid");

    expect(registry.simulationObjects.length()).toBe(1);
    expect(registry.simulationObjects.get(terrain.id)).toBe(terrain);
    expect(terrain.smartTerrainAlifeTask instanceof MockCALifeSmartTerrainTask).toBe(true);
    expect(terrain.isRegistered).toBe(true);
    expect(terrain.isOnLevel).toBe(true);
    expect(terrain.jobs).toBeDefined();
    expect(terrain.nextCheckAt).toBe(4000);
  });

  it("should correctly handle unregister", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");

    terrain.ini = MockIniFile.mock("test.ltx", {
      story_object: {
        story_id: "test_smart_sid",
      },
    });

    terrain.on_before_register();
    terrain.on_register();
    terrain.on_unregister();

    expect(registry.storyLink.idBySid.get("test_smart_sid")).toBeNull();
    expect(registry.storyLink.sidById.get(terrain.id)).toBeNull();
    expect(terrain.simulationManager.getSmartTerrainDescriptor(terrain.id)).toBeNull();
    expect(terrain.simulationManager.getSmartTerrainByName(terrain.name())).toBeNull();
    expect(terrain.isRegistered).toBe(false);
  });

  it("should correctly save and load data when have meaningful info", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");
    const processor: MockNetProcessor = new MockNetProcessor();

    const firstArriving: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondArriving: ServerHumanObject = MockAlifeHumanStalker.mock();
    const thirdWithJob: ServerHumanObject = MockAlifeHumanStalker.mock();
    const thirdJob: IObjectJobState = createObjectJobDescriptor(thirdWithJob);

    terrain.arrivingObjects.set(firstArriving.id, firstArriving);
    terrain.arrivingObjects.set(secondArriving.id, secondArriving);

    terrain.objectJobDescriptors.set(thirdWithJob.id, thirdJob);
    thirdJob.jobId = 2;
    thirdJob.jobPriority = 35;
    thirdJob.isBegun = true;
    thirdJob.desiredJob = "another_job_section";

    terrain.jobDeadTimeById.set(50, MockCTime.mock(2004, 7, 19, 13, 30, 10, 200));

    terrain.terrainControl = new SmartTerrainControl(
      terrain,
      MockIniFile.mock("test.ltx", {
        test_save: {
          noweap_zone: "no_weap_test",
          ignore_zone: "ignore_zone_test",
          alarm_start_sound: "start_sound.ogg",
          alarm_stop_sound: "stop_sound.ogg",
        },
      }),
      "test_save"
    );

    terrain.isRespawnPoint = true;
    terrain.spawnedSquadsList = new LuaTable();
    terrain.spawnedSquadsList.set("test_squad_novice", { num: 3 });
    terrain.spawnedSquadsList.set("test_squad_master", { num: 1 });

    terrain.lastRespawnUpdatedAt = MockCTime.mock(2005, 8, 20, 13, 31, 11, 201);
    terrain.stayingObjectsCount = 4;

    terrain.STATE_Write(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      "state_write_from_SmartTerrain",
      2,
      firstArriving.id,
      secondArriving.id,
      1,
      thirdWithJob.id,
      35,
      2,
      true,
      "another_job_section",
      1,
      50,
      4,
      7,
      19,
      13,
      30,
      10,
      200,
      true,
      1,
      255,
      2,
      true,
      2,
      "test_squad_novice",
      3,
      "test_squad_master",
      1,
      true,
      5,
      8,
      20,
      13,
      31,
      11,
      201,
      4,
      37,
    ]);

    const anotherTerrain: SmartTerrain = MockSmartTerrain.mockConfigured("another_smart");

    anotherTerrain.STATE_Read(processor.asNetPacket(), 5001);

    expect(anotherTerrain.arrivingObjects).toEqualLuaTables({
      [firstArriving.id]: false,
      [secondArriving.id]: false,
    });
    expect(anotherTerrain.objectJobDescriptors).toEqualLuaTables({
      [thirdWithJob.id]: {
        isBegun: true,
        jobId: 2,
        jobPriority: 35,
        desiredJob: "another_job_section",
      },
    });
    expect(anotherTerrain.jobDeadTimeById.length()).toBe(1);
    expect(anotherTerrain.jobDeadTimeById.get(50).toString()).toBe(
      MockCTime.mock(2004, 7, 19, 13, 30, 10, 200).toString()
    );

    expect(anotherTerrain.terrainControl).toBeDefined();
    expect(anotherTerrain.terrainControl?.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(anotherTerrain.terrainControl?.alarmStartedAt).toBeNull();
    expect(anotherTerrain.isRespawnPoint).toBe(true);
    expect(anotherTerrain.spawnedSquadsList).toEqualLuaTables({
      test_squad_novice: {
        num: 3,
      },
      test_squad_master: {
        num: 1,
      },
    });

    expect(anotherTerrain.lastRespawnUpdatedAt?.toString()).toBe(
      MockCTime.mock(2005, 8, 20, 13, 31, 11, 201).toString()
    );
    expect(anotherTerrain.stayingObjectsCount).toBe(4);
  });

  it("should correctly save and load data when have empty info", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_init");
    const processor: MockNetProcessor = new MockNetProcessor();

    terrain.STATE_Write(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual(["state_write_from_SmartTerrain", 0, 0, 0, false, false, 0, 6]);

    const anotherTerrain: SmartTerrain = MockSmartTerrain.mockConfigured("another_smart");

    anotherTerrain.STATE_Read(processor.asNetPacket(), 5001);

    expect(anotherTerrain.arrivingObjects.length()).toBe(0);
    expect(anotherTerrain.objectJobDescriptors.length()).toBe(0);
    expect(anotherTerrain.jobDeadTimeById.length()).toBe(0);

    expect(anotherTerrain.terrainControl).toBeDefined();
    expect(anotherTerrain.terrainControl?.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(anotherTerrain.terrainControl?.alarmStartedAt).toBeNull();
    expect(anotherTerrain.isRespawnPoint).toBe(true);
    expect(anotherTerrain.spawnedSquadsList).toEqualLuaTables({
      test_squad_novice: {
        num: 0,
      },
      test_squad_master: {
        num: 0,
      },
    });

    expect(anotherTerrain.lastRespawnUpdatedAt).toBeNull();
    expect(anotherTerrain.stayingObjectsCount).toBe(0);
  });

  it("register_npc should queue objects correctly if not registered", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(terrain.isRegistered).toBe(false);
    expect(terrain.objectsToRegister.length()).toBe(0);

    terrain.register_npc(first);
    terrain.register_npc(first);

    expect(terrain.objectsToRegister.length()).toBe(1);
    expect(terrain.objectsToRegister.get(first.id)).toBe(first);

    terrain.register_npc(second);
    terrain.register_npc(second);

    expect(terrain.objectsToRegister.length()).toBe(2);
    expect(terrain.objectsToRegister.get(first.id)).toBe(first);
    expect(terrain.objectsToRegister.get(second.id)).toBe(second);
  });

  it.todo("register_npc should correctly count and assign objects after registration");

  it.todo("should handle simulation callbacks");

  it.todo("should correctly check simulation availability");
});
