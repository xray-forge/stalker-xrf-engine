import { jest } from "@jest/globals";

import { Optional, TNumberId } from "@/engine/lib/types";
import { MockCVertex } from "@/fixtures/xray/mocks/CVertex.mock";

/**
 * Mock game graph singleton.
 */
export class MockCGameGraph {
  public static instance: Optional<MockCGameGraph> = null;
  public static registry: Record<TNumberId, MockCVertex> = {};

  public static getInstance(): MockCGameGraph {
    if (!MockCGameGraph.instance) {
      MockCGameGraph.instance = new MockCGameGraph();
    }

    return MockCGameGraph.instance;
  }

  public vertex = jest.fn((vertexId: TNumberId = 1) => {
    if (!MockCGameGraph.registry[vertexId]) {
      MockCGameGraph.registry[vertexId] = new MockCVertex(vertexId);
    }

    return MockCGameGraph.registry[vertexId];
  });

  public levels = jest.fn(() => [
    { id: 1, name: "zaton" },
    { id: 2, name: "jupiter" },
    { id: 3, name: "pripyat" },
  ]);
}
