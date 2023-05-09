import { jest } from "@jest/globals";

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
  set_snd_volume: jest.fn((volume: number) => {}),
};
