import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { IFormationObjectDescriptor } from "@/engine/core/schemes/stalker/patrol/patrol_types";
import { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import { createVector } from "@/engine/core/utils/vector";
import { LuaArray, Optional, TStringId } from "@/engine/lib/types";

export const patrolConfig = {
  /**
   * List of active patrols.
   */
  PATROLS: new LuaTable<TStringId, PatrolManager>(),
  /**
   * List of patrol formations configurations.
   */
  FORMATIONS: $fromObject<EPatrolFormation, LuaArray<IFormationObjectDescriptor>>({
    [EPatrolFormation.LINE]: $fromArray([
      { direction: createVector(-1, 0, 0), distance: 2 },
      { direction: createVector(-1, 0, 0), distance: 4 },
      { direction: createVector(-1, 0, 0), distance: 6 },
      { direction: createVector(1, 0, 0), distance: 2 },
      { direction: createVector(1, 0, 0), distance: 4 },
      { direction: createVector(1, 0, 0), distance: 6 },
    ]),
    [EPatrolFormation.BACK]: $fromArray([
      { direction: createVector(0.3, 0, -1), distance: 1.2 },
      { direction: createVector(-0.3, 0, -1), distance: 2.4 },
      { direction: createVector(0.3, 0, -1), distance: 3.6 },
      { direction: createVector(-0.3, 0, -1), distance: 4.8 },
      { direction: createVector(0.3, 0, -1), distance: 6 },
      { direction: createVector(-0.3, 0, -1), distance: 7.2 },
    ]),
    [EPatrolFormation.AROUND]: $fromArray([
      { direction: createVector(0.44721359, 0, -0.89442718), distance: 2.236068 },
      { direction: createVector(-0.44721359, 0, -0.89442718), distance: 2.236068 },
      { direction: createVector(1, 0, 0), distance: 2 },
      { direction: createVector(-1, 0, 0), distance: 2 },
      { direction: createVector(0.44721359, 0, 0.89442718), distance: 2.236068 },
      { direction: createVector(-0.44721359, 0, 0.89442718), distance: 2.236068 },
    ]),
  }),
  ACCELERATION_BY_STATE: $fromObject({
    [EStalkerState.WALK]: EStalkerState.RUN,
    [EStalkerState.PATROL]: EStalkerState.RUSH,
    [EStalkerState.RAID]: EStalkerState.ASSAULT,
    [EStalkerState.SNEAK]: EStalkerState.SNEAK_RUN,
    [EStalkerState.SNEAK_RUN]: EStalkerState.ASSAULT,
  } as Record<EStalkerState, Optional<EStalkerState>>),
};
