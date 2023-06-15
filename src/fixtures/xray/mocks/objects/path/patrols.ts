import { TName, TNumberId } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Generic patrol mock.
 */
export interface IPatrolMock {
  points: Array<{ name: TName; gvid: TNumberId; lvid: TNumberId; position: MockVector }>;
}

/**
 * Mocks of patrols for testing.
 */
export const patrols: Record<string, IPatrolMock> = {
  "test-wp": {
    points: [
      { name: "wp00|a=patrol", gvid: 110, lvid: 1000, position: MockVector.create(1, 1, 1) },
      { name: "wp01|a=patrol", gvid: 111, lvid: 1110, position: MockVector.create(5, 2, 1) },
      { name: "wp02|a=patrol", gvid: 112, lvid: 1120, position: MockVector.create(4, 1, 3) },
    ],
  },
  "test-teleport": {
    points: [{ name: "wp00", gvid: 110, lvid: 1000, position: MockVector.create(2, 1, 3) }],
  },
  "test-teleport-look": {
    points: [{ name: "wp00", gvid: 1101, lvid: 2000, position: MockVector.create(1, -1, 0.75) }],
  },
  zat_b40_smart_terrain_zat_b40_merc_01_walk: {
    points: [
      { name: "wp00|a=patrol", gvid: 10, lvid: 100, position: MockVector.create(4, 1, 1) },
      { name: "wp01|a=patrol", gvid: 11, lvid: 111, position: MockVector.create(1, 5, 1) },
      { name: "wp02|a=patrol", gvid: 12, lvid: 112, position: MockVector.create(0.25, 1, 0.5) },
    ],
  },
  zat_b40_smart_terrain_zat_b40_merc_02_look: {
    points: [
      { name: "wp00|p=30|t=10000", gvid: 20, lvid: 120, position: MockVector.create(-1, 1, 2) },
      { name: "wp01|p=70|t=10000", gvid: 21, lvid: 121, position: MockVector.create(1, -1, 1) },
      { name: "wp02|p=30|t=10000", gvid: 22, lvid: 122, position: MockVector.create(3, 1, -1) },
      { name: "wp03|p=50|t=10000", gvid: 23, lvid: 123, position: MockVector.create(1, 4, 1) },
      { name: "wp04|t=10000|a=search", gvid: 30, lvid: 130, position: MockVector.create(4, 1, 1) },
    ],
  },
};
