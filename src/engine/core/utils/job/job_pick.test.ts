import { beforeAll, describe, expect, it } from "@jest/globals";

import { registerActorServer, registerSimulator } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import {
  createObjectJobDescriptor,
  EJobType,
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
  selectSmartTerrainJob,
} from "@/engine/core/utils/job";
import { jobPreconditionCamper, jobPreconditionSniper } from "@/engine/core/utils/job/job_precondition";
import { ServerHumanObject, ServerMonsterBaseObject, TNumberId } from "@/engine/lib/types";
import { mockSmartTerrain } from "@/fixtures/engine";
import { mockServerAlifeCreatureActor, mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("job_pick utils", () => {
  beforeAll(() => {
    registerSimulator();
    registerActorServer(mockServerAlifeCreatureActor());
  });

  it("selectSmartTerrainJob should correctly get jobs for stalkers", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const object: ServerHumanObject = mockServerAlifeHumanStalker();
    const job: IObjectJobDescriptor = createObjectJobDescriptor(object);

    const [firstId, firstJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(firstId).toBeNull();
    expect(firstJob).toBeNull();

    smartTerrain.on_register();

    const [secondId, secondJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(secondId).toBe(4);
    expect(secondJob).toEqual({
      alifeTask: {
        gameVertexId: 20001,
        levelVertexId: 20002,
        taskPosition: {
          x: 10,
          y: 20,
          z: 30,
        },
      },
      gameVertexId: 20001,
      id: 4,
      isMonsterJob: false,
      levelId: 200010,
      pathType: 1,
      position: {
        x: 10,
        y: 20,
        z: 30,
      },
      preconditionFunction: jobPreconditionCamper,
      preconditionParameters: {
        wayName: "test_smart_camper_1_walk",
      },
      priority: 45,
      section: "logic@test_smart_camper_1_walk",
      type: EJobType.CAMPER,
    });

    // Assign to another object.
    (secondJob as ISmartTerrainJobDescriptor).objectId = 10;

    const [thirdId, thirdJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(thirdId).toBe(5);
    expect(thirdJob).toEqual({
      alifeTask: {
        gameVertexId: 20001,
        levelVertexId: 20002,
        taskPosition: {
          x: 10,
          y: 20,
          z: 30,
        },
      },
      gameVertexId: 20001,
      id: 5,
      isMonsterJob: false,
      levelId: 200010,
      pathType: 1,
      position: {
        x: 10,
        y: 20,
        z: 30,
      },
      preconditionFunction: jobPreconditionSniper,
      preconditionParameters: {
        wayName: "test_smart_sniper_1_walk",
      },
      section: "logic@test_smart_sniper_1_walk",

      priority: 30,
      type: EJobType.SNIPER,
    });

    // Assign to current object.
    (thirdJob as ISmartTerrainJobDescriptor).objectId = object.id;
    job.jobId = thirdJob?.id as TNumberId;

    const [fourthId, fourthJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(fourthId).toBe(thirdId);
    expect(fourthJob).toBe(thirdJob);
  });

  it("selectSmartTerrainJob should correctly get jobs for monsters", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const object: ServerMonsterBaseObject = mockServerAlifeMonsterBase();
    const job: IObjectJobDescriptor = createObjectJobDescriptor(object);

    const [firstId, firstJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(firstId).toBeNull();
    expect(firstJob).toBeNull();

    smartTerrain.on_register();

    const [secondId, secondJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(secondId).toBe(15);
    expect(secondJob).toEqual({
      alifeTask: {
        gameVertexId: 512,
        levelVertexId: 255,
        taskPosition: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
      gameVertexId: 512,
      id: 15,
      isMonsterJob: true,
      levelId: 5120,
      pathType: 2,
      position: {
        x: 1,
        y: 2,
        z: 3,
      },
      priority: 10,
      section: "logic@test_smart_home_1",
      type: EJobType.MONSTER_HOME,
    });

    // Assign to another object.
    (secondJob as ISmartTerrainJobDescriptor).objectId = 11;

    const [thirdId, thirdJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, job);

    expect(thirdId).toBe(16);
    expect(thirdJob).toEqual({
      alifeTask: {
        gameVertexId: 512,
        levelVertexId: 255,
        taskPosition: {
          x: 1,
          y: 2,
          z: 3,
        },
      },
      gameVertexId: 512,
      id: 16,
      isMonsterJob: true,
      levelId: 5120,
      pathType: 2,
      position: {
        x: 1,
        y: 2,
        z: 3,
      },
      priority: 10,
      section: "logic@test_smart_home_2",
      type: EJobType.MONSTER_HOME,
    });
  });
});
