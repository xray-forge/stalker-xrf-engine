import { jest } from "@jest/globals";

/**
 * Mock lua debug.
 */
export const mockDebug = {
  traceback: jest.fn(() => "[mock] traceback"),
  sethook: jest.fn(),
};
