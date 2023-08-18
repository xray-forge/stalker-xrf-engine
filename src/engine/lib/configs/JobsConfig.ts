import { EJobType } from "@/engine/core/utils/job";
import {
  jobPreconditionAnimpoint,
  jobPreconditionCamper,
  jobPreconditionCollector,
  jobPreconditionGuardFollower,
  jobPreconditionPatrol,
  jobPreconditionSleep,
  jobPreconditionSniper,
  jobPreconditionSurge,
  jobPreconditionWalker,
} from "@/engine/core/utils/job/job_precondition";

/**
 * Configuration of in-game jobs by type.
 */
export const jobsConfig = {
  [EJobType.EXCLUSIVE]: {},
  [EJobType.MONSTER_HOME]: {
    PRIORITY: 10,
    COUNT: 20,
    MIN_RADIUS: 10,
    MID_RADIUS: 20,
    MAX_RADIUS: 70,
  },
  [EJobType.ANIMPOINT]: {
    PRIORITY: 15,
    PRECONDITION: jobPreconditionAnimpoint,
  },
  [EJobType.CAMPER]: {
    PRIORITY: 45,
    PRECONDITION: jobPreconditionCamper,
  },
  [EJobType.COLLECTOR]: {
    PRIORITY: 25,
    PRECONDITION: jobPreconditionCollector,
  },
  [EJobType.GUARD]: {
    PRIORITY: 25,
  },
  [EJobType.GUARD_FOLLOWER]: {
    PRIORITY: 24,
    PRECONDITION: jobPreconditionGuardFollower,
  },
  [EJobType.PATROL]: {
    PRIORITY: 20,
    PRECONDITION: jobPreconditionPatrol,
  },
  [EJobType.POINT]: {
    PRIORITY: 3,
    COUNT: 20,
    MIN_RADIUS: 3,
    MAX_RADIUS: 8,
  },
  [EJobType.SLEEP]: {
    PRIORITY: 10,
    PRECONDITION: jobPreconditionSleep,
  },
  [EJobType.SNIPER]: {
    PRIORITY: 30,
    PRECONDITION: jobPreconditionSniper,
  },
  [EJobType.SURGE]: {
    PRIORITY: 50,
    PRECONDITION: jobPreconditionSurge,
  },
  [EJobType.WALKER]: {
    PRIORITY: 15,
    PRECONDITION: jobPreconditionWalker,
  },
} as const;
