import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerSimulator } from "@/engine/core/database";
import {
  graphDistance,
  graphDistanceSqr,
  isGameVertexFromLevel,
  isValidAccessibleVertex,
} from "@/engine/core/utils/vertex";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { GameObject, Vertex } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("isGameVertexFromLevel util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("isGameVertexFromLevel should correctly check level name", () => {
    expect(isGameVertexFromLevel("pripyat", 3213)).toBe(true);
    expect(isGameVertexFromLevel("pripyat", 232)).toBe(false);
    expect(isGameVertexFromLevel("zaton", 45235)).toBe(false);
    expect(isGameVertexFromLevel("zaton", 1241)).toBe(true);
  });
});

describe("graphDistance util", () => {
  it("should correctly get graph distance", () => {
    expect(graphDistance(1, 2)).toBe(20);

    const vertex: Vertex = game_graph().vertex(500);

    jest.spyOn(vertex.game_point(), "distance_to").mockImplementation(() => 1050);
    expect(graphDistance(500, 255)).toBe(1050);

    jest.spyOn(vertex.game_point(), "distance_to").mockImplementation(() => 888);
    expect(graphDistance(500, 256)).toBe(888);
  });
});

describe("graphDistanceSqr util", () => {
  it("should correctly get graph distance sqr", () => {
    expect(graphDistanceSqr(1, 2)).toBe(400);

    const vertex: Vertex = game_graph().vertex(500);

    jest.spyOn(vertex.game_point(), "distance_to").mockImplementation(() => 1050);
    expect(graphDistanceSqr(500, 255)).toBe(1_102_500);

    jest.spyOn(vertex.game_point(), "distance_to").mockImplementation(() => 888);
    expect(graphDistanceSqr(500, 256)).toBe(788_544);
  });
});

describe("isValidAccessibleVertex util", () => {
  it("should correctly reject invalid vertex values and check with object method", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "accessible").mockImplementation(() => true);

    expect(isValidAccessibleVertex(object, null)).toBe(false);
    expect(isValidAccessibleVertex(object, MAX_U32)).toBe(false);
    expect(isValidAccessibleVertex(object, MAX_U32 - 1)).toBe(true);
    expect(isValidAccessibleVertex(object, 0)).toBe(true);
    expect(isValidAccessibleVertex(object, 1)).toBe(true);

    jest.spyOn(object, "accessible").mockImplementation(() => false);

    expect(isValidAccessibleVertex(object, 0)).toBe(false);
    expect(isValidAccessibleVertex(object, 1)).toBe(false);
  });
});
