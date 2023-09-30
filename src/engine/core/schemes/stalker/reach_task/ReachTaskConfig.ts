import { createVector } from "@/engine/core/utils/vector";

export const reachTaskConfig = {
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
