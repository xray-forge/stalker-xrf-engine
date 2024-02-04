import { jest } from "@jest/globals";

import { MockNodeLogger } from "@/fixtures/cli/mocks";

/**
 * Mock global CLI libs.
 */
export function mockNodeLib(): void {
  // Simplify logger logics.
  jest.mock("#/utils/logging", () => ({
    NodeLogger: MockNodeLogger,
  }));
}
