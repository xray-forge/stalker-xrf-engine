import { TName, TNumberId } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Generic patrol mock.
 */
export interface IPatrolMock {
  points: Array<{ name: TName; gvid: TNumberId; lvid: TNumberId; position: MockVector; flag?: number }>;
}

/**
 * Mocks of patrols for testing.
 */
export const patrols: Record<string, IPatrolMock> = {
  "test-wp-single": {
    points: [{ name: "wp00|a=patrol", gvid: 110, lvid: 1000, position: MockVector.create(1, 1, 1) }],
  },
  "test-wp": {
    points: [
      { name: "wp00|a=patrol", gvid: 110, lvid: 1000, position: MockVector.create(1, 1, 1), flag: 12 },
      { name: "wp01|a=patrol|d=2000", gvid: 111, lvid: 1110, position: MockVector.create(5, 2, 1), flag: 16 },
      { name: "wp02|a=patrol|d=3000", gvid: 112, lvid: 1120, position: MockVector.create(4, 1, 3) },
    ],
  },
  "test-wp-sig": {
    points: [
      { name: "wp00|a=patrol|sig=a", gvid: 110, lvid: 1000, position: MockVector.create(1, 1, 1), flag: 12 },
      { name: "wp01|a=patrol|d=2000|sig=b", gvid: 111, lvid: 1110, position: MockVector.create(5, 2, 1), flag: 16 },
      { name: "wp02|a=patrol|d=3000|sig=c", gvid: 112, lvid: 1120, position: MockVector.create(4, 1, 3) },
    ],
  },
  "test-wp-2": {
    points: [
      { name: "wp00|a=patrol", gvid: 220, lvid: 2000, position: MockVector.create(4, 2, 1) },
      { name: "wp01|a=patrol", gvid: 221, lvid: 2110, position: MockVector.create(7, 3, 1) },
      { name: "wp02|a=patrol", gvid: 222, lvid: 2120, position: MockVector.create(5, 1, 2) },
    ],
  },
  "test-wp-advanced": {
    points: [
      { name: "wp00|a=patrol", gvid: 310, lvid: 3000, position: MockVector.create(5, 1, 3) },
      { name: "wp01|a=patrol", gvid: 311, lvid: 3110, position: MockVector.create(5, 1, 1) },
      { name: "wp02|a=patrol", gvid: 312, lvid: 3120, position: MockVector.create(2, 6, 3) },
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
  test_smart_surge_1_walk: {
    points: [
      { name: "wp00|a=patrol", gvid: 443, lvid: 1443, position: MockVector.create(21, -1, 31) },
      { name: "wp01|a=patrol", gvid: 444, lvid: 1444, position: MockVector.create(-5, 44, -21) },
    ],
  },
  test_smart_surge_1_look: {
    points: [
      { name: "wp00|a=patrol", gvid: 443, lvid: 1443, position: MockVector.create(21, -1, 31) },
      { name: "wp01|a=patrol", gvid: 444, lvid: 1444, position: MockVector.create(-5, 44, -21) },
    ],
  },
  test_smart_sleep_1: {
    points: [{ name: "wp00|a=patrol", gvid: 2443, lvid: 21443, position: MockVector.create(212, -14, 31) }],
  },
  test_smart_camper_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 6232, lvid: 12412, position: MockVector.create(12, -33, 63) }],
  },
  test_smart_camper_1_look: {
    points: [{ name: "wp00|a=patrol", gvid: 5232, lvid: 12411, position: MockVector.create(11, -33, -52) }],
  },
  test_smart_collector_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 4423, lvid: 1132, position: MockVector.create(21, -13, 63) }],
  },
  test_smart_collector_1_look: {
    points: [{ name: "wp00|a=patrol", gvid: 4424, lvid: 1133, position: MockVector.create(12, -31, -52) }],
  },
  test_smart_guard_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 3321, lvid: 32744, position: MockVector.create(1, -3, -43) }],
  },
  test_smart_patrol_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 4421, lvid: 44323, position: MockVector.create(13, -32, -34) }],
  },
  test_smart_patrol_1_look: {
    points: [{ name: "wp00|a=patrol", gvid: 554, lvid: 423231, position: MockVector.create(41, -23, -31) }],
  },
  test_smart_sniper_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 4427, lvid: 44333, position: MockVector.create(14, -33, 24) }],
  },
  test_smart_walker_1_walk: {
    points: [{ name: "wp00|a=patrol", gvid: 231, lvid: 44532, position: MockVector.create(13, -24, 21) }],
  },
  test_smart_walker_1_look: {
    points: [{ name: "wp00|a=patrol", gvid: 232, lvid: 44533, position: MockVector.create(13, -25, 1) }],
  },
  test_smart_surge_2_walk: {
    points: [
      { name: "wp00|a=patrol", gvid: 453, lvid: 1453, position: MockVector.create(-1, 3, -1) },
      { name: "wp01|a=patrol", gvid: 454, lvid: 1454, position: MockVector.create(-5, 2, 1) },
    ],
  },
  test_smart_surge_2_look: {
    points: [
      { name: "wp00|a=patrol", gvid: 443, lvid: 1443, position: MockVector.create(21, -1, 31) },
      { name: "wp01|a=patrol", gvid: 444, lvid: 1444, position: MockVector.create(-5, 44, -21) },
    ],
  },
  test_smart_sleep_2: {
    points: [{ name: "wp00|a=patrol", gvid: 2443, lvid: 21443, position: MockVector.create(212, -13, 31) }],
  },
  test_smart_surge_3_walk: {
    points: [
      { name: "wp00|a=patrol", gvid: 463, lvid: 1463, position: MockVector.create(1, 4, 1) },
      { name: "wp01|a=patrol", gvid: 464, lvid: 1464, position: MockVector.create(6, 2, 1) },
    ],
  },
};
