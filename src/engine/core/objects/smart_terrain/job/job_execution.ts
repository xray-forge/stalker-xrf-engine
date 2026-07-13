import { isInTimeInterval, NIL, Nillable, TCount, TLabel, TNumberId, TSection } from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { hardResetOfflineObject, IRegistryObjectState, registry } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { isJobAvailableToObject } from "@/engine/core/objects/smart_terrain/job/job_check";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { selectTerrainJob } from "@/engine/core/objects/smart_terrain/job/job_pick";
import { IObjectJobState, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_types";
import { isObjectArrivedToTerrain } from "@/engine/core/objects/smart_terrain/object";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setupSmartTerrainObjectJobLogic } from "@/engine/core/utils/scheme/scheme_job";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/scheme_switch";
import { resetTable } from "@/engine/core/utils/table";

const logger: LuaLogger = new LuaLogger($filename, { file: "job_execution" });

/**
 * Mark terrain job assignments as requiring a full selection pass on the next heavy tick.
 * Dirty state is an optimization hint - per-object keep-checks stay the correctness backbone.
 *
 * @param terrain - Target smart terrain to mark.
 * @param reason - Human-readable invalidation reason for logs and diagnostics.
 */
export function markTerrainJobsDirty(terrain: SmartTerrain, reason: TLabel): void {
  terrain.jobsDirty = true;
  terrain.jobsDirtyReason = reason;
}

/**
 * Perform generic sync and update of current smart terrain jobs.
 *
 * Full selection passes run on dirty ticks (arrivals, deaths, departures, dead-time expiry and
 * alarm/surge/night precondition input edges). Clean keep-checks and bounded higher-priority
 * probes run at the caller's selected cadence, following the CoC/Anomaly patterns.
 *
 * @param terrain - Target smart terrain to update current jobs state for.
 * @param isMaintenanceDue - Whether the scheduled clean maintenance pass is due.
 * @returns Whether job assignments were updated.
 */
export function updateTerrainJobs(terrain: SmartTerrain, isMaintenanceDue: boolean = true): boolean {
  // Edge-detect global precondition inputs - same next-tick latency as explicit event marks.
  const isAlarmed: boolean = $isNotNil(terrain.alarmStartedAt);
  const isSurgeStarted: boolean = surgeConfig.IS_STARTED === true;
  const isNight: boolean = isInTimeInterval(21, 7);

  if (
    terrain.jobsAlarmState !== isAlarmed ||
    terrain.jobsSurgeState !== isSurgeStarted ||
    terrain.jobsNightState !== isNight
  ) {
    terrain.jobsAlarmState = isAlarmed;
    terrain.jobsSurgeState = isSurgeStarted;
    terrain.jobsNightState = isNight;

    markTerrainJobsDirty(terrain, "environment");
  }

  for (const [id, object] of terrain.arrivingObjects) {
    if (isObjectArrivedToTerrain(object, terrain)) {
      const arrivingObjectJob: IObjectJobState = createObjectJobDescriptor(object);

      // Arrival lifts all dead-time locks so arriving objects are guaranteed to find jobs.
      resetTable(terrain.jobDeadTimeById);
      terrain.objectJobDescriptors.set(object.id, arrivingObjectJob);
      terrain.arrivingObjects.delete(id);

      selectTerrainObjectJob(terrain, arrivingObjectJob);
      markTerrainJobsDirty(terrain, "arrival");
    }
  }

  if (!terrain.jobsDirty && !isMaintenanceDue) {
    return false;
  }

  if (terrain.jobsDirty) {
    for (const [, objectJobDescriptor] of terrain.objectJobDescriptors) {
      selectTerrainObjectJob(terrain, objectJobDescriptor);
    }

    terrain.jobsDirty = false;
    terrain.jobsDirtyReason = null;
  } else {
    for (const [, objectJobDescriptor] of terrain.objectJobDescriptors) {
      maintainTerrainObjectJob(terrain, objectJobDescriptor);
    }
  }

  if (smartTerrainConfig.JOBS_SHADOW_COMPARE) {
    compareTerrainJobsWithFullSelection(terrain);
  }

  return true;
}

/**
 * Maintain object job assignment on a clean tick.
 * Keep-check validates the current job every tick; a bounded cursor probes for higher priority openings.
 * Jobless objects retry with a full scan when online or a bounded probe when offline.
 *
 * @param terrain - Target smart terrain owning the object.
 * @param objectJobDescriptor - Descriptor of active job for an object.
 */
export function maintainTerrainObjectJob(terrain: SmartTerrain, objectJobDescriptor: IObjectJobState): void {
  const job: Nillable<ISmartTerrainJobDescriptor> = objectJobDescriptor.job;

  if (job) {
    if (isJobAvailableToObject(objectJobDescriptor, job, terrain)) {
      scanForHigherPriorityTerrainJob(terrain, objectJobDescriptor);
    } else {
      // Current job became unavailable - unlink and run immediate full selection.
      unlinkTerrainObjectJob(terrain, objectJobDescriptor);

      objectJobDescriptor.job = null;
      objectJobDescriptor.jobId = -1;
      objectJobDescriptor.jobPriority = -1;
      objectJobDescriptor.scanCursor = 1;

      selectTerrainObjectJob(terrain, objectJobDescriptor);
    }
  } else if (registry.objects.has(objectJobDescriptor.object.id)) {
    selectTerrainObjectJob(terrain, objectJobDescriptor);
  } else {
    scanForAnyAvailableTerrainJob(terrain, objectJobDescriptor, smartTerrainConfig.JOB_SCAN_STEP_OFFLINE);
  }
}

/**
 * Probe a bounded slice of the priority-sorted jobs list for a strictly higher priority opening.
 * The cursor persists between ticks and wraps at the list end, resuming from the head next tick.
 *
 * @param terrain - Target smart terrain owning the object.
 * @param objectJobDescriptor - Descriptor of active job for an object.
 */
function scanForHigherPriorityTerrainJob(terrain: SmartTerrain, objectJobDescriptor: IObjectJobState): void {
  const jobsCount: TCount = terrain.jobs.length();

  if (jobsCount === 0) {
    return;
  }

  const steps: TCount = registry.objects.has(objectJobDescriptor.object.id)
    ? smartTerrainConfig.JOB_SCAN_STEP_ONLINE
    : smartTerrainConfig.JOB_SCAN_STEP_OFFLINE;

  for (const _ of $range(1, steps)) {
    if (objectJobDescriptor.scanCursor > jobsCount) {
      objectJobDescriptor.scanCursor = 1;

      return;
    }

    const it: ISmartTerrainJobDescriptor = terrain.jobs.get(objectJobDescriptor.scanCursor);

    objectJobDescriptor.scanCursor += 1;

    if (
      !it.objectId &&
      it.priority > objectJobDescriptor.jobPriority &&
      isJobAvailableToObject(objectJobDescriptor, it, terrain)
    ) {
      objectJobDescriptor.scanCursor = 1;

      assignTerrainJobToObject(terrain, objectJobDescriptor, it);

      return;
    }
  }
}

/**
 * Probe a bounded slice of the jobs list for any available job, used by jobless offline objects.
 *
 * @param terrain - Target smart terrain owning the object.
 * @param objectJobDescriptor - Descriptor of active job for an object.
 * @param steps - Number of jobs to examine on this tick.
 */
function scanForAnyAvailableTerrainJob(
  terrain: SmartTerrain,
  objectJobDescriptor: IObjectJobState,
  steps: TCount
): void {
  const jobsCount: TCount = terrain.jobs.length();

  if (jobsCount === 0) {
    return;
  }

  for (const _ of $range(1, steps)) {
    if (objectJobDescriptor.scanCursor > jobsCount) {
      objectJobDescriptor.scanCursor = 1;

      return;
    }

    const it: ISmartTerrainJobDescriptor = terrain.jobs.get(objectJobDescriptor.scanCursor);

    objectJobDescriptor.scanCursor += 1;

    if (
      (!it.objectId || it.id === objectJobDescriptor.jobId) &&
      isJobAvailableToObject(objectJobDescriptor, it, terrain)
    ) {
      objectJobDescriptor.scanCursor = 1;

      assignTerrainJobToObject(terrain, objectJobDescriptor, it);

      return;
    }
  }
}

/**
 * Compare current incremental assignments against a dry-run full selection and log divergences
 * that outlive the bounded cursor sweep period. Log-only diagnostic, identical in all builds.
 *
 * @param terrain - Target smart terrain to check.
 */
export function compareTerrainJobsWithFullSelection(terrain: SmartTerrain): void {
  for (const [, objectJobDescriptor] of terrain.objectJobDescriptors) {
    const [selectedJobId] = selectTerrainJob(terrain, terrain.jobs, objectJobDescriptor);

    if ($isNil(selectedJobId) || selectedJobId === objectJobDescriptor.jobId) {
      objectJobDescriptor.shadowDivergentTicks = 0;
    } else {
      const divergentTicks: TCount = (objectJobDescriptor.shadowDivergentTicks ?? 0) + 1;

      objectJobDescriptor.shadowDivergentTicks = divergentTicks;

      // Bounded cursor staleness is by design - report only divergence outliving two full sweeps.
      if (divergentTicks === math.ceil(terrain.jobs.length() / smartTerrainConfig.JOB_SCAN_STEP_OFFLINE) * 2) {
        logger.info(
          "Shadow compare divergence: %s %s current %s expected %s ticks %s",
          terrain.name(),
          objectJobDescriptor.object.name(),
          objectJobDescriptor.jobId,
          selectedJobId,
          divergentTicks
        );
      }
    }
  }
}

/**
 * @param terrain - Smart terrain to get object job for.
 * @param jobSection - Section of job to get working object ID.
 * @returns ID of game object working with provided section.
 */
export function getTerrainObjectIdByJobSection(terrain: SmartTerrain, jobSection: TSection): TNumberId {
  return terrain.objectByJobSection.get(jobSection);
}

/**
 * @param terrain - Target smart terrain to unlink job in.
 * @param objectJobDescriptor - Descriptor of object job state.
 */
export function unlinkTerrainObjectJob(terrain: SmartTerrain, objectJobDescriptor: IObjectJobState): void {
  if (objectJobDescriptor.job) {
    terrain.objectByJobSection.delete(objectJobDescriptor.job.section);
    objectJobDescriptor.job.objectId = null;
  }
}

/**
 * Try switch smart terrain object to desired object (stored in descriptor).
 * Tries to gracefully assign job for the object and find new one if someone already took it.
 *
 * @param terrain - Target smart terrain to switch job in.
 * @param objectId - Target object ID to switch job for.
 */
export function switchTerrainObjectToDesiredJob(terrain: SmartTerrain, objectId: TNumberId): void {
  logger.info("Switch to desired job: %s %s", terrain.name(), objectId);

  const objectJobDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(objectId);
  const changingObjectId: Nillable<TNumberId> = terrain.objectByJobSection.get(objectJobDescriptor.desiredJob);

  // todo: What if desired job is NIL?

  // Just replacing when no another object exists / no jobs for another object.
  if (!changingObjectId || !terrain.objectJobDescriptors.get(changingObjectId)) {
    unlinkTerrainObjectJob(terrain, objectJobDescriptor);

    objectJobDescriptor.job = null;
    objectJobDescriptor.jobId = -1;
    objectJobDescriptor.jobPriority = -1;

    selectTerrainObjectJob(terrain, objectJobDescriptor);
  } else {
    unlinkTerrainObjectJob(terrain, objectJobDescriptor);

    const selectedJob: Nillable<ISmartTerrainJobDescriptor> = terrain.objectJobDescriptors.get(changingObjectId).job;

    // Desired job holder may be transiently jobless under lenient selection - fall back to generic re-selection.
    if (!selectedJob) {
      objectJobDescriptor.job = null;
      objectJobDescriptor.jobId = -1;
      objectJobDescriptor.jobPriority = -1;

      selectTerrainObjectJob(terrain, objectJobDescriptor);

      return;
    }

    selectedJob.objectId = objectJobDescriptor.object.id;

    objectJobDescriptor.desiredJob = NIL;
    objectJobDescriptor.jobId = selectedJob.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJob.priority;
    objectJobDescriptor.isBegun = true;
    objectJobDescriptor.job = selectedJob;

    terrain.objectByJobSection.set(terrain.jobs.get(selectedJob.id as TNumberId).section, selectedJob.objectId);

    const state: Nillable<IRegistryObjectState> = registry.objects.get(objectId) as Nillable<IRegistryObjectState>;

    if (state) {
      setupSmartTerrainObjectJobLogic(terrain, state.object!);
    }

    // For previous object reset current job and then select new one.
    // Make sure next free highest priority job is assigned to the object.
    const changingObjectJobDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(changingObjectId);

    changingObjectJobDescriptor.job = null;
    changingObjectJobDescriptor.jobId = -1;
    changingObjectJobDescriptor.jobPriority = -1;

    selectTerrainObjectJob(terrain, changingObjectJobDescriptor);
  }
}

/**
 * Select new job for provided object descriptor.
 *
 * When no job is currently suitable (mass dead-time locks, transient over-population) the object
 * is left jobless and retries on subsequent heavy ticks instead of aborting - proven lenient
 * behavior from anomaly, scales with population.
 *
 * @param terrain - Target smart terrain to select job in.
 * @param objectJobDescriptor - Descriptor of active job for an object.
 */
export function selectTerrainObjectJob(
  terrain: SmartTerrain,
  objectJobDescriptor: IObjectJobState
): LuaMultiReturn<[Nillable<TNumberId>, Nillable<ISmartTerrainJobDescriptor>]> {
  const [selectedJobId, selectedJob] = selectTerrainJob(terrain, terrain.jobs, objectJobDescriptor);

  if ($isNil(selectedJobId) || $isNil(selectedJob)) {
    logger.info(
      "! Insufficient smart terrain jobs, object stays jobless: %s, %s @ '%s' %s %s/%s",
      terrain.name(),
      objectJobDescriptor.object.name(),
      terrain.simulationRole,
      table.size(terrain.jobs),
      terrain.stayingObjectsCount,
      terrain.maxStayingSquadsCount
    );

    unlinkTerrainObjectJob(terrain, objectJobDescriptor);

    objectJobDescriptor.job = null;
    objectJobDescriptor.jobId = -1;
    objectJobDescriptor.jobPriority = -1;
    objectJobDescriptor.scanCursor = 1;

    return $multi(null, null);
  }

  assignTerrainJobToObject(terrain, objectJobDescriptor, selectedJob);

  return $multi(selectedJobId, selectedJob);
}

/**
 * Link the selected job to the object descriptor and begin its execution when needed.
 *
 * @param terrain - Target smart terrain to assign job in.
 * @param objectJobDescriptor - Descriptor of active job for an object.
 * @param selectedJob - Job to assign to the object.
 */
export function assignTerrainJobToObject(
  terrain: SmartTerrain,
  objectJobDescriptor: IObjectJobState,
  selectedJob: ISmartTerrainJobDescriptor
): void {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(
    objectJobDescriptor.object.id
  ) as Nillable<IRegistryObjectState>;

  // Job changed and current job exists.
  if (selectedJob.id !== objectJobDescriptor.jobId) {
    // Clear previous.
    unlinkTerrainObjectJob(terrain, objectJobDescriptor);

    // Link new job.
    selectedJob.objectId = objectJobDescriptor.object.id;

    objectJobDescriptor.isBegun = false;
    objectJobDescriptor.jobId = selectedJob.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJob.priority;
    objectJobDescriptor.job = selectedJob;

    terrain.objectByJobSection.set(terrain.jobs.get(selectedJob.id as TNumberId).section, selectedJob.objectId);

    // Reset object active scheme.
    if (state) {
      switchObjectSchemeToSection(state.object, terrain.jobsConfig, NIL);
    }
  }

  // Start job execution if it was not started before or new job is selected.
  if (!objectJobDescriptor.isBegun) {
    hardResetOfflineObject(objectJobDescriptor.object.id);

    objectJobDescriptor.isBegun = true;

    // Setup logic and switch to desired section.
    if (state) {
      setupSmartTerrainObjectJobLogic(terrain, state.object!);
    }
  }
}
