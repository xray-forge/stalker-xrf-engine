import { hardResetOfflineObject, IRegistryObjectState, registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { selectSmartTerrainJob } from "@/engine/core/objects/smart_terrain/job/job_pick";
import { IObjectJobState, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_types";
import { isObjectArrivedToSmartTerrain } from "@/engine/core/objects/smart_terrain/object";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setupSmartTerrainObjectJobLogic } from "@/engine/core/utils/scheme/scheme_initialization";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/scheme_switch";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "job_execution" });

/**
 * Perform generic sync and update of current smart terrain jobs.
 *
 * @param smartTerrain - target smart terrain to update current jobs state for
 */
export function updateSmartTerrainJobs(smartTerrain: SmartTerrain): void {
  for (const [id, object] of smartTerrain.arrivingObjects) {
    if (isObjectArrivedToSmartTerrain(object, smartTerrain)) {
      const arrivingObjectJob: IObjectJobState = createObjectJobDescriptor(object);

      smartTerrain.jobDeadTimeById = new LuaTable();
      smartTerrain.objectJobDescriptors.set(object.id, arrivingObjectJob);
      smartTerrain.arrivingObjects.delete(id);

      selectSmartTerrainObjectJob(smartTerrain, arrivingObjectJob);
    }
  }

  table.sort(smartTerrain.objectJobDescriptors, (a, b) => a.jobPriority < b.jobPriority);

  for (const [, objectJobDescriptor] of smartTerrain.objectJobDescriptors) {
    selectSmartTerrainObjectJob(smartTerrain, objectJobDescriptor);
  }
}

/**
 * @param smartTerrain - smart terrain to get object job for
 * @param jobSection - section of job to get working object ID
 * @returns ID of game object working with provided section
 */
export function getSmartTerrainObjectIdByJobSection(smartTerrain: SmartTerrain, jobSection: TSection): TNumberId {
  return smartTerrain.objectByJobSection.get(jobSection);
}

/**
 * @param smartTerrain - target smart terrain to unlink job in
 * @param objectJobDescriptor - descriptor of object job state
 */
export function unlinkSmartTerrainObjectJob(smartTerrain: SmartTerrain, objectJobDescriptor: IObjectJobState): void {
  if (objectJobDescriptor.job) {
    smartTerrain.objectByJobSection.delete(objectJobDescriptor.job.section);
    objectJobDescriptor.job.objectId = null;
  }
}

/**
 * Try switch smart terrain object to desired object (stored in descriptor).
 * Tries to gracefully assign job for the object and find new one if someone already took it.
 *
 * @param smartTerrain - target smart terrain to switch job in
 * @param objectId - target object ID to switch job for
 */
export function switchSmartTerrainObjectToDesiredJob(smartTerrain: SmartTerrain, objectId: TNumberId): void {
  logger.format("Switch to desired job: %s %s", smartTerrain.name(), objectId);

  const objectJobDescriptor: IObjectJobState = smartTerrain.objectJobDescriptors.get(objectId);
  const changingObjectId: Optional<TNumberId> = smartTerrain.objectByJobSection.get(objectJobDescriptor.desiredJob);

  // todo: What if desired job is NIL?

  // Just replacing when no another object exists / no jobs for another object.
  if (!changingObjectId || !smartTerrain.objectJobDescriptors.get(changingObjectId)) {
    unlinkSmartTerrainObjectJob(smartTerrain, objectJobDescriptor);

    objectJobDescriptor.job = null;
    objectJobDescriptor.jobId = -1;
    objectJobDescriptor.jobPriority = -1;

    selectSmartTerrainObjectJob(smartTerrain, objectJobDescriptor);
  } else {
    unlinkSmartTerrainObjectJob(smartTerrain, objectJobDescriptor);

    const selectedJob: ISmartTerrainJobDescriptor = smartTerrain.objectJobDescriptors.get(changingObjectId).job!;

    selectedJob.objectId = objectJobDescriptor.object.id;

    objectJobDescriptor.desiredJob = NIL;
    objectJobDescriptor.jobId = selectedJob.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJob.priority;
    objectJobDescriptor.isBegun = true;
    objectJobDescriptor.job = selectedJob;

    smartTerrain.objectByJobSection.set(
      smartTerrain.jobs.get(selectedJob.id as TNumberId).section,
      selectedJob.objectId
    );

    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId) as Optional<IRegistryObjectState>;

    if (state) {
      setupSmartTerrainObjectJobLogic(smartTerrain, state.object!);
    }

    // For previous object reset current job and then select new one.
    // Make sure next free highest priority job is assigned to the object.
    const changingObjectJobDescriptor: IObjectJobState = smartTerrain.objectJobDescriptors.get(changingObjectId);

    changingObjectJobDescriptor.job = null;
    changingObjectJobDescriptor.jobId = -1;
    changingObjectJobDescriptor.jobPriority = -1;

    selectSmartTerrainObjectJob(smartTerrain, changingObjectJobDescriptor);
  }
}

/**
 * Select new job for provided object descriptor
 *
 * @param smartTerrain - target smart terrain to select job in
 * @param objectJobDescriptor - descriptor of active job for an object
 */
export function selectSmartTerrainObjectJob(
  smartTerrain: SmartTerrain,
  objectJobDescriptor: IObjectJobState
): LuaMultiReturn<[Optional<TNumberId>, Optional<ISmartTerrainJobDescriptor>]> {
  const [selectedJobId, selectedJob] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, objectJobDescriptor);

  if (selectedJobId === null) {
    abort(
      "Insufficient smart terrain jobs: %s, %s @ '%s' '%s' %s/%s",
      smartTerrain.name(),
      objectJobDescriptor.object.name(),
      smartTerrain.simulationRole,
      table.size(smartTerrain.jobs),
      objectJobDescriptor.jobId,
      smartTerrain.stayingObjectsCount,
      smartTerrain.maxStayingSquadsCount
    );
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(
    objectJobDescriptor.object.id
  ) as Optional<IRegistryObjectState>;

  // Job changed and current job exists.
  if (selectedJob && selectedJobId !== objectJobDescriptor.jobId) {
    // Clear previous.
    unlinkSmartTerrainObjectJob(smartTerrain, objectJobDescriptor);

    // Link new job.
    selectedJob.objectId = objectJobDescriptor.object.id;

    objectJobDescriptor.isBegun = false;
    objectJobDescriptor.jobId = selectedJob.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJob.priority;
    objectJobDescriptor.job = selectedJob;

    smartTerrain.objectByJobSection.set(
      smartTerrain.jobs.get(selectedJob.id as TNumberId).section,
      selectedJob.objectId
    );

    // Reset object active scheme.
    if (state) {
      switchObjectSchemeToSection(state.object, smartTerrain.jobsConfig, NIL);
    }
  }

  // Start job execution if it was not started before or new job is selected.
  if (!objectJobDescriptor.isBegun) {
    hardResetOfflineObject(objectJobDescriptor.object.id);

    objectJobDescriptor.isBegun = true;

    // Setup logic and switch to desired section.
    if (state) {
      setupSmartTerrainObjectJobLogic(smartTerrain, state.object!);
    }
  }

  return $multi(selectedJobId, selectedJob);
}
