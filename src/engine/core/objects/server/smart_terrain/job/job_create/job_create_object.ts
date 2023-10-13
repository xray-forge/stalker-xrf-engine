import { IObjectJobDescriptor } from "@/engine/core/objects/server/smart_terrain/job/job_types";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ESchemeType, ServerCreatureObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Create descriptor of object job in smart terrain.
 * Stores current state of work for provided server object.
 *
 * @param object - server creature object to create job descriptor for
 * @returns descriptor object for provided server creature object
 */
export function createObjectJobDescriptor(object: ServerCreatureObject): IObjectJobDescriptor {
  const isObjectStalker: boolean = isStalker(object);

  return {
    object: object,
    isMonster: !isObjectStalker,
    desiredJob: NIL,
    jobPriority: -1,
    job: null,
    jobId: -1, // -1 so any other jobs can be considered
    isBegun: false,
    schemeType: isObjectStalker ? ESchemeType.STALKER : ESchemeType.MONSTER,
  };
}
