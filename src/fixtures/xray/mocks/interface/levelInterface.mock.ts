import { jest } from "@jest/globals";

/**
 * todo;
 */
export const mockLevelInterface = {
  name: jest.fn(() => null),
  get_game_difficulty: jest.fn(() => 3),
};
