import { hardResetOfflineObject, IRegistryObjectState, registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_create";
import { selectTerrainJob } from "@/engine/core/objects/smart_terrain/job/job_pick";
import { IObjectJobState, ISmartTerrainJobDescriptor } from "@/engine/core/objects/smart_terrain/job/job_types";
import { isObjectArrivedToTerrain } from "@/engine/core/objects/smart_terrain/object";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setupSmartTerrainObjectJobLogic } from "@/engine/core/utils/scheme/scheme_job";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/scheme_switch";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "job_execution" });

/**
 * Perform generic sync and update of current smart terrain jobs.
 *
 * @param terrain - target smart terrain to update current jobs state for
 */
export function updateTerrainJobs(terrain: SmartTerrain): void {
  for (const [id, object] of terrain.arrivingObjects) {
    if (isObjectArrivedToTerrain(object, terrain)) {
      const arrivingObjectJob: IObjectJobState = createObjectJobDescriptor(object);

      terrain.jobDeadTimeById = new LuaTable();
      terrain.objectJobDescriptors.set(object.id, arrivingObjectJob);
      terrain.arrivingObjects.delete(id);

      selectTerrainObjectJob(terrain, arrivingObjectJob);
    }
  }

  table.sort(terrain.objectJobDescriptors, (a, b) => a.jobPriority < b.jobPriority);

  for (const [, objectJobDescriptor] of terrain.objectJobDescriptors) {
    selectTerrainObjectJob(terrain, objectJobDescriptor);
  }
}

/**
 * @param terrain - smart terrain to get object job for
 * @param jobSection - section of job to get working object ID
 * @returns ID of game object working with provided section
 */
export function getTerrainObjectIdByJobSection(terrain: SmartTerrain, jobSection: TSection): TNumberId {
  return terrain.objectByJobSection.get(jobSection);
}

/**
 * @param terrain - target smart terrain to unlink job in
 * @param objectJobDescriptor - descriptor of object job state
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
 * @param terrain - target smart terrain to switch job in
 * @param objectId - target object ID to switch job for
 */
export function switchTerrainObjectToDesiredJob(terrain: SmartTerrain, objectId: TNumberId): void {
  logger.info("Switch to desired job: %s %s", terrain.name(), objectId);

  const objectJobDescriptor: IObjectJobState = terrain.objectJobDescriptors.get(objectId);
  const changingObjectId: Optional<TNumberId> = terrain.objectByJobSection.get(objectJobDescriptor.desiredJob);

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

    const selectedJob: ISmartTerrainJobDescriptor = terrain.objectJobDescriptors.get(changingObjectId).job!;

    selectedJob.objectId = objectJobDescriptor.object.id;

    objectJobDescriptor.desiredJob = NIL;
    objectJobDescriptor.jobId = selectedJob.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJob.priority;
    objectJobDescriptor.isBegun = true;
    objectJobDescriptor.job = selectedJob;

    terrain.objectByJobSection.set(terrain.jobs.get(selectedJob.id as TNumberId).section, selectedJob.objectId);

    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId) as Optional<IRegistryObjectState>;

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
 * Select new job for provided object descriptor
 *
 * @param terrain - target smart terrain to select job in
 * @param objectJobDescriptor - descriptor of active job for an object
 */
export function selectTerrainObjectJob(
  terrain: SmartTerrain,
  objectJobDescriptor: IObjectJobState
): LuaMultiReturn<[Optional<TNumberId>, Optional<ISmartTerrainJobDescriptor>]> {
  const [selectedJobId, selectedJob] = selectTerrainJob(terrain, terrain.jobs, objectJobDescriptor);

  if (selectedJobId === null) {
    abort(
      "Insufficient smart terrain jobs: %s, %s @ '%s' '%s' %s/%s",
      terrain.name(),
      objectJobDescriptor.object.name(),
      terrain.simulationRole,
      table.size(terrain.jobs),
      objectJobDescriptor.jobId,
      terrain.stayingObjectsCount,
      terrain.maxStayingSquadsCount
    );
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(
    objectJobDescriptor.object.id
  ) as Optional<IRegistryObjectState>;

  // Job changed and current job exists.
  if (selectedJob && selectedJobId !== objectJobDescriptor.jobId) {
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

  return $multi(selectedJobId, selectedJob);
}
