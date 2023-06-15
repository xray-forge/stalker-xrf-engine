import { jest } from "@jest/globals";

import { Optional } from "@/engine/lib/types";
import { MockCUIGameCustom } from "@/fixtures/xray";

let mockHudSingleton: Optional<MockCUIGameCustom> = null;

/**
 * Get game hud mock.
 */
export const mockGetGameHud = jest.fn(() => {
  if (!mockHudSingleton) {
    mockHudSingleton = new MockCUIGameCustom();
  }

  return mockHudSingleton;
});
