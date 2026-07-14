import { LuaArray, Nillable, TCount, TDuration, TNumberId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { type SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { compareTerrainJobsWithFullSelection, selectTerrainObjectJob } from "@/engine/core/objects/smart_terrain/job";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";

interface IDirtyTerrainJobPass {
  terrain: SmartTerrain;
  revision: TCount;
  objectIds: LuaArray<TNumberId>;
  cursor: TCount;
  isInitialized: boolean;
}

/**
 * Schedule dirty smart-terrain job reselections within a per-frame budget.
 */
export class SmartTerrainJobScheduler {
  private dirtyTerrainJobPasses: LuaTable<TNumberId, IDirtyTerrainJobPass> = new LuaTable();
  private dirtyTerrainJobQueue: LuaArray<IDirtyTerrainJobPass> = new LuaTable();
  private dirtyTerrainJobQueueHead: TCount = 1;
  private dirtyTerrainJobPassesCount: TCount = 0;
  private dirtyTerrainJobCredits: TCount = 0;

  /**
   * Queue dirty terrains that registered before scheduler initialization.
   */
  public initialize(): void {
    for (const [, terrain] of simulationConfig.TERRAINS) {
      if (terrain.isRegistered && terrain.jobsDirty) {
        this.schedule(terrain);
      }
    }
  }

  /**
   * Process pending reselections within the current time-scaled budget.
   *
   * @param delta - Time passed since the previous actor update, in milliseconds.
   */
  public update(delta: TDuration): void {
    this.dirtyTerrainJobCredits = math.min(
      simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_FRAME,
      this.dirtyTerrainJobCredits + (delta * simulationConfig.SMART_TERRAIN_DIRTY_JOBS_PER_SECOND) / 1_000
    );

    if (this.dirtyTerrainJobCredits < 1 || this.dirtyTerrainJobPassesCount === 0) {
      return;
    }

    while (this.dirtyTerrainJobCredits >= 1) {
      const pass: Nillable<IDirtyTerrainJobPass> = this.dequeuePass();

      if (!pass) {
        break;
      }

      this.processPass(pass);
      this.dirtyTerrainJobCredits -= 1;
    }
  }

  /**
   * Schedule a terrain after registration when it has pending job changes.
   *
   * @param terrain - Newly registered smart terrain.
   */
  public register(terrain: SmartTerrain): void {
    if (terrain.jobsDirty) {
      this.schedule(terrain);
    }
  }

  /**
   * Drop scheduled work for an unregistered terrain.
   *
   * @param terrain - Smart terrain leaving the active simulation.
   */
  public unregister(terrain: SmartTerrain): void {
    if ($isNotNil(this.dirtyTerrainJobPasses.get(terrain.id))) {
      this.dirtyTerrainJobPasses.delete(terrain.id);
      this.dirtyTerrainJobPassesCount -= 1;
    }

    terrain.jobsDirtyScheduled = false;
  }

  /**
   * Queue a dirty terrain once. Descriptor ids are captured on first processing.
   *
   * @param terrain - Smart terrain requiring full job reselection.
   */
  public schedule(terrain: SmartTerrain): void {
    if (terrain.jobsDirtyScheduled || !terrain.isRegistered) {
      return;
    }

    const pass: IDirtyTerrainJobPass = {
      terrain: terrain,
      revision: terrain.jobsDirtyRevision,
      objectIds: new LuaTable(),
      cursor: 1,
      isInitialized: false,
    };

    terrain.jobsDirtyScheduled = true;
    this.dirtyTerrainJobPasses.set(terrain.id, pass);
    this.dirtyTerrainJobPassesCount += 1;

    table.insert(this.dirtyTerrainJobQueue, pass);
  }

  /**
   * Reset transient scheduler state.
   */
  public reset(): void {
    for (const [, pass] of this.dirtyTerrainJobPasses) {
      pass.terrain.jobsDirtyScheduled = false;
    }

    this.dirtyTerrainJobPasses = new LuaTable();
    this.dirtyTerrainJobQueue = new LuaTable();
    this.dirtyTerrainJobQueueHead = 1;
    this.dirtyTerrainJobPassesCount = 0;
    this.dirtyTerrainJobCredits = 0;
  }

  /**
   * Get the number of terrains with pending passes.
   *
   * @returns Pending terrain pass count.
   */
  public getPendingPassesCount(): TCount {
    return this.dirtyTerrainJobPassesCount;
  }

  /**
   * Process one descriptor and requeue an unfinished terrain pass.
   *
   * @param pass - Scheduled terrain pass to advance.
   */
  private processPass(pass: IDirtyTerrainJobPass): void {
    const terrain: SmartTerrain = pass.terrain;

    if (this.dirtyTerrainJobPasses.get(terrain.id) !== pass || !terrain.isRegistered) {
      return;
    }

    if (!pass.isInitialized) {
      pass.revision = terrain.jobsDirtyRevision;
      pass.isInitialized = true;

      for (const [objectId] of terrain.objectJobDescriptors) {
        table.insert(pass.objectIds, objectId);
      }
    }

    const objectId: Nillable<TNumberId> = pass.objectIds.get(pass.cursor);

    if ($isNotNil(objectId)) {
      const descriptor = terrain.objectJobDescriptors.get(objectId);

      if ($isNotNil(descriptor)) {
        selectTerrainObjectJob(terrain, descriptor);
      }
    }

    pass.cursor += 1;

    if (pass.cursor <= pass.objectIds.length()) {
      table.insert(this.dirtyTerrainJobQueue, pass);

      return;
    }

    if (terrain.jobsDirtyRevision === pass.revision) {
      terrain.jobsDirty = false;
      terrain.jobsDirtyReason = null;
      terrain.jobsDirtyScheduled = false;
      this.dirtyTerrainJobPasses.delete(terrain.id);
      this.dirtyTerrainJobPassesCount -= 1;

      if (smartTerrainConfig.JOBS_SHADOW_COMPARE) {
        compareTerrainJobsWithFullSelection(terrain);
      }
    } else {
      terrain.jobsDirtyScheduled = false;
      this.dirtyTerrainJobPasses.delete(terrain.id);
      this.dirtyTerrainJobPassesCount -= 1;

      this.schedule(terrain);
    }
  }

  /**
   * Take the next terrain pass and compact consumed queue entries.
   *
   * @returns Next scheduled pass or null when the queue is empty.
   */
  private dequeuePass(): Nillable<IDirtyTerrainJobPass> {
    const pass: Nillable<IDirtyTerrainJobPass> = this.dirtyTerrainJobQueue.get(this.dirtyTerrainJobQueueHead);

    if (!pass) {
      return null;
    }

    this.dirtyTerrainJobQueueHead += 1;

    if (this.dirtyTerrainJobQueueHead > this.dirtyTerrainJobQueue.length()) {
      this.dirtyTerrainJobQueue = new LuaTable();
      this.dirtyTerrainJobQueueHead = 1;
    } else if (this.dirtyTerrainJobQueueHead > 64) {
      const compactedQueue: LuaArray<IDirtyTerrainJobPass> = new LuaTable();

      for (let index: TCount = this.dirtyTerrainJobQueueHead; index <= this.dirtyTerrainJobQueue.length(); index += 1) {
        table.insert(compactedQueue, this.dirtyTerrainJobQueue.get(index));
      }

      this.dirtyTerrainJobQueue = compactedQueue;
      this.dirtyTerrainJobQueueHead = 1;
    }

    return pass;
  }
}
