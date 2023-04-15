import { jest } from "@jest/globals";

import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

/**
 * todo;
 */
export const mockGameInterface = {
  CTime: jest.fn(() => new MockCTime()),
  get_game_time: jest.fn(() => new MockCTime()),
  translate_string: jest.fn((key: string) => "translated_" + key),
};
