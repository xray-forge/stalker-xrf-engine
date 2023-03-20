import { jest } from "@jest/globals";

import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * todo;
 */
export class MockCVertex {
  public static DEFAULT_VERTEX_ID: number = 1;
  public static DEFAULT_LEVEL_ID: number = 1;

  public level_vertex_id = jest.fn(() => MockCVertex.DEFAULT_VERTEX_ID);
  public level_id = jest.fn(() => MockCVertex.DEFAULT_LEVEL_ID);
  public game_point = jest.fn(() => new MockVector());
  public level_point = jest.fn(() => new MockVector());
}
