import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { registerActorServer, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation";
import { Actor } from "@/engine/core/objects/creature";
import { IObjectJobState, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain/index";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { ServerHumanObject } from "@/engine/lib/types";
import { mockSmartTerrain, mockSmartTerrainWithConfiguration, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import {
  EPacketDataType,
  MockCALifeSmartTerrainTask,
  MockCTime,
  mockIniFile,
  MockNetProcessor,
  mockServerAlifeCreatureActor,
  mockServerAlifeHumanStalker,
} from "@/fixtures/xray";

describe("SmartTerrain class generic logic", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    registerActorServer(mockServerAlifeCreatureActor() as Actor);
  });

  it("should correctly init default fields", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    expect(smartTerrain.ini).toBeUndefined();
    expect(smartTerrain.jobsConfig).toBeUndefined();
    expect(smartTerrain.jobsConfigName).toBeUndefined();

    expect(smartTerrain.squadId).toBe(0);
    expect(smartTerrain.isOnLevel).toBe(false);
    expect(smartTerrain.simulationRole).toBe(ESimulationTerrainRole.DEFAULT);
    expect(smartTerrain.smartTerrainDisplayedMapSpot).toBeNull();
    expect(smartTerrain.respawnSector).toBeNull();
    expect(smartTerrain.forbiddenPoint).toBe("");

    expect(smartTerrain.isRegistered).toBe(false);
    expect(smartTerrain.isRespawnPoint).toBe(false);
    expect(smartTerrain.isObjectsInitializationNeeded).toBe(false);
    expect(smartTerrain.isSimulationAvailableConditionList).toEqualLuaTables(parseConditionsList(TRUE));
    expect(smartTerrain.isMutantDisabled).toBe(false);
    expect(smartTerrain.isMutantLair).toBe(false);
    expect(smartTerrain.isRespawnOnlySmart).toBe(false);
    expect(smartTerrain.areCampfiresOn).toBe(false);

    expect(smartTerrain.alarmStartedAt).toBeNull();
    expect(smartTerrain.arrivalDistance).toBe(25);
    expect(smartTerrain.population).toBe(0);
    expect(smartTerrain.maxPopulation).toBe(0);
    expect(smartTerrain.nextCheckAt).toBe(0);
    expect(smartTerrain.lastRespawnUpdatedAt).toBeNull();

    expect(smartTerrain.travelerActorPointName).toBe("");
    expect(smartTerrain.travelerSquadPointName).toBe("");

    expect(smartTerrain.defendRestrictor).toBeNull();
    expect(smartTerrain.attackRestrictor).toBeNull();
    expect(smartTerrain.safeRestrictor).toBeNull();
    expect(smartTerrain.spawnPointName).toBeNull();
    expect(smartTerrain.smartTerrainActorControl).toBeNull();

    expect(smartTerrain.arrivingObjects.length()).toBe(0);
    expect(smartTerrain.jobs.length()).toBe(0);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(0);
    expect(smartTerrain.objectByJobSection.length()).toBe(0);
    expect(smartTerrain.jobDeadTimeById.length()).toBe(0);
    expect(smartTerrain.smartTerrainAlifeTask).toBeUndefined();

    expect(smartTerrain.simulationBoardManager).toBeDefined();
    expect(smartTerrain.mapDisplayManager).toBeDefined();
    expect(smartTerrain.simulationProperties).toBeUndefined();
    expect(smartTerrain.spawnSquadsConfiguration.length()).toBe(0);
    expect(smartTerrain.spawnedSquadsList.length()).toBe(0);
  });

  it("should correctly emit registering lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    const onSmartTerrainRegister = jest.fn();
    const onSmartTerrainUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_REGISTER, onSmartTerrainRegister);
    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_UNREGISTER, onSmartTerrainUnregister);

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    expect(onSmartTerrainRegister).toHaveBeenCalledWith(smartTerrain);
    expect(onSmartTerrainUnregister).not.toHaveBeenCalled();

    smartTerrain.on_unregister();

    expect(onSmartTerrainRegister).toHaveBeenCalledWith(smartTerrain);
    expect(onSmartTerrainUnregister).toHaveBeenCalledWith(smartTerrain);
  });

  it("should correctly handle before register", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    smartTerrain.on_before_register();

    expect(smartTerrain.simulationBoardManager.getSmartTerrainByName(smartTerrain.name())).toBe(smartTerrain);
    expect(smartTerrain.simulationBoardManager.getSmartTerrainPopulation(smartTerrain.id)).toBe(0);
  });

  it("should correctly handle register", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    jest.spyOn(smartTerrain, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        story_object: {
          story_id: "test_smart_sid",
        },
      });
    });

    smartTerrain.ini = smartTerrain.spawn_ini();

    replaceFunctionMock(time_global, () => 4000);

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    expect(registry.storyLink.idBySid.get("test_smart_sid")).toBe(smartTerrain.id);
    expect(registry.storyLink.sidById.get(smartTerrain.id)).toBe("test_smart_sid");

    expect(registry.simulationObjects.length()).toBe(1);
    expect(registry.simulationObjects.get(smartTerrain.id)).toBe(smartTerrain);
    expect(smartTerrain.smartTerrainAlifeTask instanceof MockCALifeSmartTerrainTask).toBe(true);
    expect(smartTerrain.isRegistered).toBe(true);
    expect(smartTerrain.isOnLevel).toBe(true);
    expect(smartTerrain.jobs).toBeDefined();
    expect(smartTerrain.nextCheckAt).toBe(4000);
  });

  it("should correctly handle unregister", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    smartTerrain.ini = mockIniFile("test.ltx", {
      story_object: {
        story_id: "test_smart_sid",
      },
    });

    smartTerrain.on_before_register();
    smartTerrain.on_register();
    smartTerrain.on_unregister();

    expect(registry.storyLink.idBySid.get("test_smart_sid")).toBeNull();
    expect(registry.storyLink.sidById.get(smartTerrain.id)).toBeNull();
    expect(smartTerrain.simulationBoardManager.getSmartTerrainDescriptor(smartTerrain.id)).toBeNull();
    expect(smartTerrain.simulationBoardManager.getSmartTerrainByName(smartTerrain.name())).toBeNull();
    expect(smartTerrain.isRegistered).toBe(false);
  });

  it("should correctly save and load data when have meaningful info", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    const firstArriving: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondArriving: ServerHumanObject = mockServerAlifeHumanStalker();
    const thirdWithJob: ServerHumanObject = mockServerAlifeHumanStalker();
    const thirdJob: IObjectJobState = createObjectJobDescriptor(thirdWithJob);

    smartTerrain.arrivingObjects.set(firstArriving.id, firstArriving);
    smartTerrain.arrivingObjects.set(secondArriving.id, secondArriving);

    smartTerrain.objectJobDescriptors.set(thirdWithJob.id, thirdJob);
    thirdJob.jobId = 2;
    thirdJob.jobPriority = 35;
    thirdJob.isBegun = true;
    thirdJob.desiredJob = "another_job_section";

    smartTerrain.jobDeadTimeById.set(50, MockCTime.mock(2004, 7, 19, 13, 30, 10, 200));

    smartTerrain.smartTerrainActorControl = new SmartTerrainControl(
      smartTerrain,
      mockIniFile("test.ltx", {
        test_save: {
          noweap_zone: "no_weap_test",
          ignore_zone: "ignore_zone_test",
          alarm_start_sound: "start_sound.ogg",
          alarm_stop_sound: "stop_sound.ogg",
        },
      }),
      "test_save"
    );

    smartTerrain.isRespawnPoint = true;
    smartTerrain.spawnedSquadsList = new LuaTable();
    smartTerrain.spawnedSquadsList.set("test_squad_novice", { num: 3 });
    smartTerrain.spawnedSquadsList.set("test_squad_master", { num: 1 });

    smartTerrain.lastRespawnUpdatedAt = MockCTime.mock(2005, 8, 20, 13, 31, 11, 201);
    smartTerrain.population = 4;

    smartTerrain.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
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
    expect(netProcessor.dataList).toEqual([
      "SmartTerrain",
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
      0,
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

    const anotherSmartTerrain: SmartTerrain = mockSmartTerrainWithConfiguration("another_smart");

    anotherSmartTerrain.STATE_Read(netProcessor.asMockNetPacket(), 5001);

    expect(anotherSmartTerrain.arrivingObjects).toEqualLuaTables({
      [firstArriving.id]: false,
      [secondArriving.id]: false,
    });
    expect(anotherSmartTerrain.objectJobDescriptors).toEqualLuaTables({
      [thirdWithJob.id]: {
        isBegun: true,
        jobId: 2,
        jobPriority: 35,
        desiredJob: "another_job_section",
      },
    });
    expect(anotherSmartTerrain.jobDeadTimeById.length()).toBe(1);
    expect(anotherSmartTerrain.jobDeadTimeById.get(50).toString()).toBe(
      MockCTime.mock(2004, 7, 19, 13, 30, 10, 200).toString()
    );

    expect(anotherSmartTerrain.smartTerrainActorControl).toBeDefined();
    expect(anotherSmartTerrain.smartTerrainActorControl?.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(anotherSmartTerrain.smartTerrainActorControl?.alarmStartedAt).toBeNull();
    expect(anotherSmartTerrain.isRespawnPoint).toBe(true);
    expect(anotherSmartTerrain.spawnedSquadsList).toEqualLuaTables({
      test_squad_novice: {
        num: 3,
      },
      test_squad_master: {
        num: 1,
      },
    });

    expect(anotherSmartTerrain.lastRespawnUpdatedAt?.toString()).toBe(
      MockCTime.mock(2005, 8, 20, 13, 31, 11, 201).toString()
    );
    expect(anotherSmartTerrain.population).toBe(4);
  });

  it("should correctly save and load data when have empty info", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    smartTerrain.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["SmartTerrain", 0, 0, 0, false, false, 0, 6]);

    const anotherSmartTerrain: SmartTerrain = mockSmartTerrainWithConfiguration("another_smart");

    anotherSmartTerrain.STATE_Read(netProcessor.asMockNetPacket(), 5001);

    expect(anotherSmartTerrain.arrivingObjects.length()).toBe(0);
    expect(anotherSmartTerrain.objectJobDescriptors.length()).toBe(0);
    expect(anotherSmartTerrain.jobDeadTimeById.length()).toBe(0);

    expect(anotherSmartTerrain.smartTerrainActorControl).toBeDefined();
    expect(anotherSmartTerrain.smartTerrainActorControl?.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(anotherSmartTerrain.smartTerrainActorControl?.alarmStartedAt).toBeNull();
    expect(anotherSmartTerrain.isRespawnPoint).toBe(true);
    expect(anotherSmartTerrain.spawnedSquadsList).toEqualLuaTables({
      test_squad_novice: {
        num: 0,
      },
      test_squad_master: {
        num: 0,
      },
    });

    expect(anotherSmartTerrain.lastRespawnUpdatedAt).toBeNull();
    expect(anotherSmartTerrain.population).toBe(0);
  });

  it.todo("should handle simulation callbacks");

  it.todo("should correctly check simulation availability");
});
