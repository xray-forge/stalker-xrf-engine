import { jest } from "@jest/globals";

import { MockCVertex } from "@/fixtures/xray/mocks/CVertex.mock";

/**
 * todo;
 */
export class MockCGameGraph {
  public vertex = jest.fn(() => new MockCVertex());
}
