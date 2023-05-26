import { jest } from "@jest/globals";
import { game_object } from "xray16";

import { TNumberId } from "@/engine/lib/types";

export const CLIENT_SIDE_REGISTRY: Record<TNumberId, game_object> = {};

/**
 * Mock game `level` interface.
 */
export const mockLevelInterface = {
  disable_input: jest.fn(),
  get_game_difficulty: jest.fn(() => 3),
  get_snd_volume: jest.fn(() => 1),
  get_time_hours: jest.fn(() => 12),
  map_add_object_spot: jest.fn(),
  name: jest.fn(() => null),
  object_by_id: jest.fn((id: TNumberId) => CLIENT_SIDE_REGISTRY[id] || null),
  set_snd_volume: jest.fn((volume: number) => {}),
};
