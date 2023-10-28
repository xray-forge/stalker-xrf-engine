import type { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task/ReachTaskPatrolManager";
import { createVector } from "@/engine/core/utils/vector";
import { TNumberId } from "@/engine/lib/types";

export const reachTaskConfig = {
  // todo: Delete patrol managers when finalize actions and no participants registered.
  PATROLS: new LuaTable<TNumberId, ReachTaskPatrolManager>(),
  FORMATIONS: {
    back: [
      { dir: createVector(0.7, 0, -0.5), dist: 1.2 },
      { dir: createVector(-0.7, 0, -0.5), dist: 1.2 },
      { dir: createVector(0.4, 0, -1), dist: 2.4 },
      { dir: createVector(-0.4, 0, -1), dist: 2.4 },
      { dir: createVector(0.7, 0, -1), dist: 3.6 },
      { dir: createVector(-0.7, 0, -1), dist: 3.6 },
      { dir: createVector(0.7, 0, -1), dist: 4.8 },
      { dir: createVector(-0.7, 0, -1), dist: 4.8 },
      { dir: createVector(0.7, 0, -1), dist: 6 },
      { dir: createVector(-0.7, 0, -1), dist: 6 },
      { dir: createVector(0.7, 0, -1), dist: 7.2 },
      { dir: createVector(-0.7, 0, -1), dist: 7.2 },
      { dir: createVector(0.7, 0, -1), dist: 8.4 },
      { dir: createVector(-0.7, 0, -1), dist: 8.4 },
      { dir: createVector(0.7, 0, -1), dist: 9.6 },
      { dir: createVector(-0.7, 0, -1), dist: 9.6 },
    ],
  },
};
