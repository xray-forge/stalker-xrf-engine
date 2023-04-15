import { jest } from "@jest/globals";

/**
 * todo;
 */
export const mockLevelInterface = {
  name: jest.fn(() => null),
  get_game_difficulty: jest.fn(() => 3),
  map_add_object_spot: jest.fn(),
  get_time_hours: jest.fn(() => 12),
};
