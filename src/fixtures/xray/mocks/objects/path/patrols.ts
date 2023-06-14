import { TName, TNumberId } from "@/engine/lib/types";

/**
 * Generic patrol mock.
 */
export interface IPatrolMock {
  points: Array<{ name: TName; gvid: TNumberId; lvid: TNumberId }>;
}

/**
 * Mocks of patrols for testing.
 */
export const patrols: Record<string, IPatrolMock> = {
  "test-wp": {
    points: [
      { name: "wp00|a=patrol", gvid: 110, lvid: 1000 },
      { name: "wp01|a=patrol", gvid: 111, lvid: 1110 },
      { name: "wp02|a=patrol", gvid: 112, lvid: 1120 },
    ],
  },
  zat_b40_smart_terrain_zat_b40_merc_01_walk: {
    points: [
      { name: "wp00|a=patrol", gvid: 10, lvid: 100 },
      { name: "wp01|a=patrol", gvid: 11, lvid: 111 },
      { name: "wp02|a=patrol", gvid: 12, lvid: 112 },
    ],
  },
  zat_b40_smart_terrain_zat_b40_merc_02_look: {
    points: [
      { name: "wp00|p=30|t=10000", gvid: 20, lvid: 120 },
      { name: "wp01|p=70|t=10000", gvid: 21, lvid: 121 },
      { name: "wp02|p=30|t=10000", gvid: 22, lvid: 122 },
      { name: "wp03|p=50|t=10000", gvid: 23, lvid: 123 },
      { name: "wp04|t=10000|a=search", gvid: 30, lvid: 130 },
    ],
  },
};
