import { hardResetOfflineObject, IRegistryObjectState, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  createObjectJobDescriptor,
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
  selectSmartTerrainJob,
} from "@/engine/core/objects/smart_terrain/job";
import { isObjectArrivedToSmartTerrain } from "@/engine/core/objects/smart_terrain/object";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { getSchemeFromSection } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  activateSchemeBySection,
  configureObjectSchemes,
  getSectionToActivate,
  switchObjectSchemeToSection,
} from "@/engine/core/utils/scheme";
import { NIL } from "@/engine/lib/constants/words";
import { GameObject, IniFile, Optional, TName, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "job_execution" });

/**
 * todo: Description.
 */
export function updateSmartTerrainJobs(smartTerrain: SmartTerrain): void {
  for (const [id, object] of smartTerrain.arrivingObjects) {
    if (isObjectArrivedToSmartTerrain(object, smartTerrain)) {
      smartTerrain.objectJobDescriptors.set(object.id, createObjectJobDescriptor(object));
      smartTerrain.jobDeadTimeById = new LuaTable();

      selectObjectJob(smartTerrain, smartTerrain.objectJobDescriptors.get(object.id));

      smartTerrain.arrivingObjects.delete(id);
    }
  }

  table.sort(smartTerrain.objectJobDescriptors, (a, b) => a.jobPriority < b.jobPriority);

  for (const [, objectJobDescriptor] of smartTerrain.objectJobDescriptors) {
    selectObjectJob(smartTerrain, objectJobDescriptor);
  }
}

/**
 * todo: Description.
 */
export function setupObjectJobLogic(smartTerrain: SmartTerrain, object: GameObject): void {
  // logger.info("Setup logic:", this.name(), object.name());

  const objectJobDescriptor: IObjectJobDescriptor = smartTerrain.objectJobDescriptors.get(object.id());
  const job: ISmartTerrainJobDescriptor = smartTerrain.jobs.get(objectJobDescriptor.jobId);
  const ltx: IniFile = job.iniFile || smartTerrain.jobsConfig;
  const ltxName: TName = job.iniPath || smartTerrain.jobsConfigName;

  configureObjectSchemes(object, ltx, ltxName, objectJobDescriptor.schemeType, job.section, smartTerrain.name());

  const section: TSection = getSectionToActivate(object, ltx, job.section);

  assertDefined(
    getSchemeFromSection(job.section),
    "[smart_terrain %s] section=%s, don't use section 'null'!",
    smartTerrain.name(),
    section
  );

  activateSchemeBySection(object, ltx, section, smartTerrain.name(), false);
}

/**
 * todo: Description.
 */
export function getSmartTerrainJobByObjectId(
  smartTerrain: SmartTerrain,
  objectId: TNumberId
): Optional<ISmartTerrainJobDescriptor> {
  const descriptor: Optional<IObjectJobDescriptor> = smartTerrain.objectJobDescriptors.get(objectId);

  return descriptor && smartTerrain.jobs.get(descriptor.jobId);
}

/**
 * @param smartTerrain - smart terrain to get object job for
 * @param jobSection - section of job to get working object ID
 * @returns ID of game object working with provided section
 */
export function getObjectIdByJobSection(smartTerrain: SmartTerrain, jobSection: TSection): TNumberId {
  return smartTerrain.objectByJobSection.get(jobSection);
}

/**
 * todo: Description.
 */
export function unlinkObjectJob(smartTerrain: SmartTerrain, objectJobDescriptor: IObjectJobDescriptor): void {
  if (objectJobDescriptor.job) {
    smartTerrain.objectByJobSection.delete(objectJobDescriptor.job.section);
    objectJobDescriptor.job.objectId = null;
  }
}

/**
 * todo: Description.
 */
export function switchObjectToDesiredJob(smartTerrain: SmartTerrain, objectId: TNumberId): void {
  logger.info("Switch to desired job:", smartTerrain.name(), objectId);

  const objectInfo: IObjectJobDescriptor = smartTerrain.objectJobDescriptors.get(objectId);
  const changingObjectId: Optional<TNumberId> = smartTerrain.objectByJobSection.get(objectInfo.desiredJob);

  // Just replacing when no another object exists / no jobs for another object.
  if (!changingObjectId || !smartTerrain.objectJobDescriptors.get(changingObjectId)) {
    unlinkObjectJob(smartTerrain, objectInfo);

    objectInfo.job = null;
    objectInfo.jobId = -1;
    objectInfo.jobPriority = -1;

    selectObjectJob(smartTerrain, objectInfo);
  } else {
    unlinkObjectJob(smartTerrain, objectInfo);

    const selectedJobLink: ISmartTerrainJobDescriptor = smartTerrain.objectJobDescriptors.get(changingObjectId).job!;

    selectedJobLink.objectId = objectInfo.object.id;

    smartTerrain.objectByJobSection.set(
      smartTerrain.jobs.get(selectedJobLink.id as TNumberId).section,
      selectedJobLink.objectId
    );

    objectInfo.jobId = selectedJobLink.id as TNumberId;
    objectInfo.jobPriority = selectedJobLink.priority;
    objectInfo.isBegun = true;
    objectInfo.job = selectedJobLink;
    objectInfo.desiredJob = NIL;

    const state: Optional<IRegistryObjectState> = registry.objects.get(objectId) as Optional<IRegistryObjectState>;

    if (state) {
      setupObjectJobLogic(smartTerrain, state.object!);
    }

    const changingObjectInfo: IObjectJobDescriptor = smartTerrain.objectJobDescriptors.get(changingObjectId);

    changingObjectInfo.job = null;
    changingObjectInfo.jobId = -1;
    changingObjectInfo.jobPriority = -1;

    selectObjectJob(smartTerrain, changingObjectInfo);
  }
}

/**
 * Select new job for provided object descriptor
 *
 * @param smartTerrain
 * @param objectJobDescriptor - descriptor of active job for an object
 */
export function selectObjectJob(smartTerrain: SmartTerrain, objectJobDescriptor: IObjectJobDescriptor): void {
  const [selectedJobId, selectedJobLink] = selectSmartTerrainJob(smartTerrain, smartTerrain.jobs, objectJobDescriptor);

  if (selectedJobId === null) {
    abort(
      "Insufficient smart terrain jobs: %s, %s @ '%s' '%s' %s/%s",
      smartTerrain.name(),
      objectJobDescriptor.object.name(),
      smartTerrain.simulationRole,
      table.size(smartTerrain.jobs),
      objectJobDescriptor.jobId,
      smartTerrain.population,
      smartTerrain.maxPopulation
    );
  }

  const state: Optional<IRegistryObjectState> = registry.objects.get(
    objectJobDescriptor.object.id
  ) as Optional<IRegistryObjectState>;

  // Job changed and current job exists.
  if (selectedJobId !== objectJobDescriptor.jobId && selectedJobLink !== null) {
    unlinkObjectJob(smartTerrain, objectJobDescriptor);

    // Link new job.
    selectedJobLink.objectId = objectJobDescriptor.object.id;
    smartTerrain.objectByJobSection.set(
      smartTerrain.jobs.get(selectedJobLink.id as TNumberId).section,
      selectedJobLink.objectId
    );

    objectJobDescriptor.jobId = selectedJobLink.id as TNumberId;
    objectJobDescriptor.jobPriority = selectedJobLink.priority;
    objectJobDescriptor.isBegun = false;
    objectJobDescriptor.job = selectedJobLink;

    // Reset object active scheme.
    if (state) {
      switchObjectSchemeToSection(state.object, smartTerrain.jobsConfig, NIL);
    }
  }

  // Begin job execution.
  if (!objectJobDescriptor.isBegun) {
    hardResetOfflineObject(objectJobDescriptor.object.id);

    objectJobDescriptor.isBegun = true;

    // Setup logic and switch to desired section.
    if (state) {
      setupObjectJobLogic(smartTerrain, state.object!);
    }
  }
}
