import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyObject, TNumberId } from "xray16/lib";

import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SmartTerrainJobScheduler } from "@/engine/core/managers/simulation/SmartTerrainJobScheduler";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import * as jobExecution from "@/engine/core/objects/smart_terrain/job/job_execution";
import { IObjectJobState } from "@/engine/core/objects/smart_terrain/job/job_types";
import { MockSmartTerrain } from "@/fixtures/engine";

function mockDirtyTerrain(id: TNumberId, descriptorIds: Array<TNumberId>): SmartTerrain {
  const terrain: SmartTerrain = MockSmartTerrain.mock();

  (terrain as AnyObject).id = id;
  terrain.isRegistered = true;
  terrain.jobsDirty = true;

  for (const descriptorId of descriptorIds) {
    terrain.objectJobDescriptors.set(descriptorId, {} as IObjectJobState);
  }

  return terrain;
}

describe("SmartTerrainJobScheduler", () => {
  beforeEach(() => {
    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_SECOND = 960;
    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_FRAME = 16;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should interleave dirty terrain descriptors in round-robin order", () => {
    const scheduler: SmartTerrainJobScheduler = new SmartTerrainJobScheduler();
    const selectJob = jest.spyOn(jobExecution, "selectTerrainObjectJob").mockImplementation(() => $multi(null, null));
    const firstTerrain: SmartTerrain = mockDirtyTerrain(1, [11, 12]);
    const secondTerrain: SmartTerrain = mockDirtyTerrain(2, [21, 22]);

    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_SECOND = 1;
    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_FRAME = 1;

    scheduler.schedule(firstTerrain);
    scheduler.schedule(secondTerrain);

    scheduler.update(1_000);
    scheduler.update(1_000);
    scheduler.update(1_000);
    scheduler.update(1_000);

    expect(selectJob).toHaveBeenCalledTimes(4);
    expect(selectJob.mock.calls.map(([, descriptor]) => descriptor)).toEqual([
      firstTerrain.objectJobDescriptors.get(11),
      secondTerrain.objectJobDescriptors.get(21),
      firstTerrain.objectJobDescriptors.get(12),
      secondTerrain.objectJobDescriptors.get(22),
    ]);
    expect(firstTerrain.jobsDirty).toBe(false);
    expect(secondTerrain.jobsDirty).toBe(false);
  });

  it("should cap dirty-job work in a single frame", () => {
    const scheduler: SmartTerrainJobScheduler = new SmartTerrainJobScheduler();
    const selectJob = jest.spyOn(jobExecution, "selectTerrainObjectJob").mockImplementation(() => $multi(null, null));

    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_SECOND = 1_000;
    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_FRAME = 2;

    for (let index: TNumberId = 1; index <= 3; index += 1) {
      const terrain: SmartTerrain = mockDirtyTerrain(index, [index]);

      scheduler.schedule(terrain);
    }

    scheduler.update(1_000);

    expect(selectJob).toHaveBeenCalledTimes(2);
  });

  it("should restart a completed pass after an invalidation during processing", () => {
    const scheduler: SmartTerrainJobScheduler = new SmartTerrainJobScheduler();
    const selectJob = jest.spyOn(jobExecution, "selectTerrainObjectJob").mockImplementation(() => $multi(null, null));
    const terrain: SmartTerrain = mockDirtyTerrain(1, [11, 12]);

    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_SECOND = 1;
    simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_FRAME = 1;

    scheduler.schedule(terrain);
    scheduler.update(1_000);

    terrain.jobsDirtyRevision += 1;
    scheduler.update(1_000);
    scheduler.update(1_000);

    expect(selectJob.mock.calls.map(([, descriptor]) => descriptor)).toEqual([
      terrain.objectJobDescriptors.get(11),
      terrain.objectJobDescriptors.get(12),
      terrain.objectJobDescriptors.get(11),
    ]);
    expect(terrain.jobsDirty).toBe(true);

    scheduler.update(1_000);

    expect(terrain.jobsDirty).toBe(false);
  });

  it("should discard queued work when terrain unregisters", () => {
    const scheduler: SmartTerrainJobScheduler = new SmartTerrainJobScheduler();
    const selectJob = jest.spyOn(jobExecution, "selectTerrainObjectJob").mockImplementation(() => $multi(null, null));
    const terrain: SmartTerrain = mockDirtyTerrain(1, [11]);

    scheduler.schedule(terrain);
    terrain.isRegistered = false;
    scheduler.unregister(terrain);
    scheduler.unregister(terrain);

    scheduler.update(1_000);

    expect(selectJob).not.toHaveBeenCalled();
    expect(terrain.jobsDirtyScheduled).toBe(false);
    expect(scheduler.getPendingPassesCount()).toBe(0);
  });
});
