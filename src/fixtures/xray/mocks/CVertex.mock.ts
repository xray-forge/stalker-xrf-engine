import { jest } from "@jest/globals";

import { TNumberId } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * todo;
 */
export class MockCVertex {
  public vertexId: TNumberId;
  public gamePoint: MockVector = new MockVector();
  public levelPoint: MockVector = new MockVector();

  public constructor(vertexId: TNumberId) {
    this.vertexId = vertexId;
  }

  public level_vertex_id = jest.fn(() => this.vertexId);
  public level_id = jest.fn(() => this.vertexId * 10);
  public game_point = jest.fn(() => this.gamePoint);
  public level_point = jest.fn(() => this.levelPoint);
}
