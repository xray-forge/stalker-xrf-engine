import { jest } from "@jest/globals";

import { TNumberId } from "@/engine/lib/types";
import { MockCVertex } from "@/fixtures/xray/mocks/CVertex.mock";

/**
 * todo;
 */
export class MockCGameGraph {
  public static registry: Record<TNumberId, MockCVertex> = {};

  public vertex = jest.fn((vertexId: TNumberId = 1) => {
    if (!MockCGameGraph.registry[vertexId]) {
      MockCGameGraph.registry[vertexId] = new MockCVertex(vertexId);
    }

    return MockCGameGraph.registry[vertexId];
  });
}
