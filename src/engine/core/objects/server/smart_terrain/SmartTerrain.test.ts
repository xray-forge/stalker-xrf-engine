import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { ESimulationTerrainRole, SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { createObjectJobDescriptor, IObjectJobDescriptor } from "@/engine/core/utils/job";
import { TRUE } from "@/engine/lib/constants/words";
import { ServerHumanObject } from "@/engine/lib/types";
import { mockSmartTerrain, mockSmartTerrainWithConfiguration } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/utils";
import {
  EPacketDataType,
  MockCALifeSmartTerrainTask,
  MockCTime,
  mockIniFile,
  MockNetProcessor,
  mockServerAlifeHumanStalker,
} from "@/fixtures/xray";

describe("SmartTerrain class generic logic", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
    registry.simulationObjects = new LuaTable();
    registry.storyLink.sidById = new LuaTable();
    registry.storyLink.idBySid = new LuaTable();
  });

  it("should correctly init default fields", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    expect(smartTerrain.ini).toBeUndefined();
    expect(smartTerrain.jobsLtxConfig).toBeUndefined();
    expect(smartTerrain.jobsLtxConfigName).toBeUndefined();

    expect(smartTerrain.squadId).toBe(0);
    expect(smartTerrain.level).toBe("");
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
    expect(smartTerrain.maxPopulation).toBe(-1);
    expect(smartTerrain.nextCheckAt).toBe(0);
    expect(smartTerrain.lastRespawnUpdatedAt).toBeNull();

    expect(smartTerrain.travelerActorPath).toBe("");
    expect(smartTerrain.travelerSquadPath).toBe("");

    expect(smartTerrain.defendRestrictor).toBeNull();
    expect(smartTerrain.attackRestrictor).toBeNull();
    expect(smartTerrain.safeRestrictor).toBeNull();
    expect(smartTerrain.spawnPointName).toBeNull();
    expect(smartTerrain.smartTerrainActorControl).toBeNull();

    expect(smartTerrain.arrivingObjects.length()).toBe(0);
    expect(smartTerrain.jobs).toBeUndefined();
    expect(smartTerrain.jobsData.length()).toBe(0);
    expect(smartTerrain.objectJobDescriptors.length()).toBe(0);
    expect(smartTerrain.objectByJobSection.length()).toBe(0);
    expect(smartTerrain.jobDeadTimeById.length()).toBe(0);
    expect(smartTerrain.smartTerrainAlifeTask).toBeUndefined();

    expect(smartTerrain.simulationBoardManager).toBeDefined();
    expect(smartTerrain.mapDisplayManager).toBeDefined();
    expect(smartTerrain.simulationProperties).toBeUndefined();
    expect(smartTerrain.respawnConfiguration.length()).toBe(0);
    expect(smartTerrain.alreadySpawned.length()).toBe(0);
  });

  it("should correctly handle before register", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    smartTerrain.on_before_register();

    expect(smartTerrain.level).toBe("pripyat");
    expect(smartTerrain.simulationBoardManager.getSmartTerrainByName(smartTerrain.name())).toBe(smartTerrain);
    expect(smartTerrain.simulationBoardManager.getSmartTerrainPopulation(smartTerrain)).toBe(0);
  });

  it("should correctly generate captions", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");

    expect(smartTerrain.getNameCaption()).toBe("st_test_init_100002_name");
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
    jest.spyOn(smartTerrain, "registerDelayedObjects");

    smartTerrain.ini = smartTerrain.spawn_ini();

    replaceFunctionMock(time_global, () => 4000);

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    expect(registry.storyLink.idBySid.get("test_smart_sid")).toBe(smartTerrain.id);
    expect(registry.storyLink.sidById.get(smartTerrain.id)).toBe("test_smart_sid");

    expect(smartTerrain.level).toBe("pripyat");

    expect(registry.simulationObjects.length()).toBe(1);
    expect(registry.simulationObjects.get(smartTerrain.id)).toBe(smartTerrain);
    expect(smartTerrain.smartTerrainAlifeTask instanceof MockCALifeSmartTerrainTask).toBe(true);
    expect(smartTerrain.isRegistered).toBe(true);
    expect(smartTerrain.jobs).toBeDefined();
    expect(smartTerrain.registerDelayedObjects).toHaveBeenCalledTimes(1);
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
    expect(smartTerrain.simulationBoardManager.getSmartTerrainDescriptorById(smartTerrain.id)).toBeNull();
    expect(smartTerrain.simulationBoardManager.getSmartTerrainByName(smartTerrain.name())).toBeNull();
    expect(smartTerrain.isRegistered).toBe(false);
  });

  it("should correctly save and load data when have meaningful info", () => {
    const smartTerrain: SmartTerrain = new SmartTerrain("test_init");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    const firstArriving: ServerHumanObject = mockServerAlifeHumanStalker();
    const secondArriving: ServerHumanObject = mockServerAlifeHumanStalker();
    const thirdWithJob: ServerHumanObject = mockServerAlifeHumanStalker();
    const thirdJob: IObjectJobDescriptor = createObjectJobDescriptor(thirdWithJob);

    smartTerrain.arrivingObjects.set(firstArriving.id, firstArriving);
    smartTerrain.arrivingObjects.set(secondArriving.id, secondArriving);

    smartTerrain.objectJobDescriptors.set(thirdWithJob.id, thirdJob);
    thirdJob.job_id = 2;
    thirdJob.job_prior = 35;
    thirdJob.begin_job = true;
    thirdJob.need_job = "another_job_section";

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
    smartTerrain.alreadySpawned = new LuaTable();
    smartTerrain.alreadySpawned.set("test_squad_novice", { num: 3 });
    smartTerrain.alreadySpawned.set("test_squad_master", { num: 1 });

    smartTerrain.lastRespawnUpdatedAt = MockCTime.mock(2005, 8, 20, 13, 31, 11, 201);
    smartTerrain.population = 4;

    smartTerrain.STATE_Write(netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
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

    mockSmartTerrain();
    anotherSmartTerrain.STATE_Read(netProcessor.asMockNetPacket(), 5001);

    expect(anotherSmartTerrain.arrivingObjects).toEqualLuaTables({
      [firstArriving.id]: false,
      [secondArriving.id]: false,
    });
    expect(anotherSmartTerrain.objectJobDescriptors).toEqualLuaTables({
      [thirdWithJob.id]: {
        begin_job: true,
        job_id: 2,
        job_prior: 35,
        need_job: "another_job_section",
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
    expect(anotherSmartTerrain.alreadySpawned).toEqualLuaTables({
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
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([0, 0, 0, false, false, 0, 6]);

    const anotherSmartTerrain: SmartTerrain = mockSmartTerrainWithConfiguration("another_smart");

    mockSmartTerrain();
    anotherSmartTerrain.STATE_Read(netProcessor.asMockNetPacket(), 5001);

    expect(anotherSmartTerrain.arrivingObjects.length()).toBe(0);
    expect(anotherSmartTerrain.objectJobDescriptors.length()).toBe(0);
    expect(anotherSmartTerrain.jobDeadTimeById.length()).toBe(0);

    expect(anotherSmartTerrain.smartTerrainActorControl).toBeDefined();
    expect(anotherSmartTerrain.smartTerrainActorControl?.status).toBe(ESmartTerrainStatus.NORMAL);
    expect(anotherSmartTerrain.smartTerrainActorControl?.alarmStartedAt).toBeNull();
    expect(anotherSmartTerrain.isRespawnPoint).toBe(true);
    expect(anotherSmartTerrain.alreadySpawned).toEqualLuaTables({
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
});
