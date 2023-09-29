import { jest } from "@jest/globals";

import { MockCMainMenu } from "@/fixtures/xray/mocks/managers/CMainMenu.mock";

/**
 * Mock xray main menu method table interface.
 */
export const mockMainMenuInterface = {
  get_main_menu: jest.fn(() => MockCMainMenu.getInstance()),
};
