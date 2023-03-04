import { jest } from "@jest/globals";

import { mockGetConsole } from "@/fixtures/console";

/**
 * todo;
 */
export function mockXRay16({ get_console = mockGetConsole } = {}): void {
  jest.mock("xray16", () => ({
    get_console,
  }));
}
