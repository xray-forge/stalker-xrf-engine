import { jest } from "@jest/globals";
import { Nillable } from "xray16/lib";
import { MockCUIGameCustom } from "xray16/mocks";

let mockHudSingleton: Nillable<MockCUIGameCustom> = null;

/**
 * Get game hud mock.
 */
export const mockGetGameHud = jest.fn(() => {
  if (!mockHudSingleton) {
    mockHudSingleton = new MockCUIGameCustom();
  }

  return mockHudSingleton;
});
