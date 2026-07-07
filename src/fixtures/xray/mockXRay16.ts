import { jest } from "@jest/globals";

import * as mockXRay16Runtime from "@/fixtures/xray/mockXRay16Runtime";

/**
 * Replace the `xray16` module with the single `mockXRay16Runtime` definition.
 */
export function mockXRay16(): void {
  jest.mock("xray16", () => mockXRay16Runtime);
}
