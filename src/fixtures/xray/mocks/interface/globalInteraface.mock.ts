import { jest } from "@jest/globals";

import { MockCUIGameCustom } from "@/fixtures/xray";

/**
 * Get game hud mock.
 */
export const mockGetGameHud = jest.fn(() => new MockCUIGameCustom());
