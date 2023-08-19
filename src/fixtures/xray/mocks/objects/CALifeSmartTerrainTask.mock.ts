import type { TName, TNumberId, Vector } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock generic alife task for smart terrains.
 */
export class MockCALifeSmartTerrainTask {
  private readonly gameVertexId: TNumberId;
  private readonly levelVertexId: TNumberId;
  public readonly taskPosition: Vector;

  public constructor(gameVertexId: TNumberId | TName, levelVertexId: TNumberId) {
    if (typeof gameVertexId === "string") {
      this.gameVertexId = 20001;
      this.levelVertexId = 20002;
      this.taskPosition = MockVector.mock(10, 20, 30);
    } else {
      this.gameVertexId = gameVertexId;
      this.levelVertexId = levelVertexId;
      this.taskPosition = MockVector.mock(1, 2, 3);
    }
  }

  public game_vertex_id(): TNumberId {
    return this.gameVertexId;
  }

  public level_vertex_id(): TNumberId {
    return this.levelVertexId;
  }

  public position(): Vector {
    return this.taskPosition;
  }
}
