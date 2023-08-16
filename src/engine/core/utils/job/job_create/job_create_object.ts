import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isStalker } from "@/engine/core/utils/object/object_class";
import { NIL } from "@/engine/lib/constants/words";
import { ESchemeType, ServerCreatureObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function createObjectJobDescriptor(object: ServerCreatureObject): IObjectJobDescriptor {
  logger.info("Create object job descriptor:", object.name());

  const isObjectStalker: boolean = isStalker(object);

  return {
    serverObject: object,
    isMonster: !isObjectStalker,
    need_job: NIL,
    job_prior: -1,
    job_link: null,
    jobId: -1,
    begin_job: false,
    schemeType: isObjectStalker ? ESchemeType.STALKER : ESchemeType.MONSTER,
  };
}
