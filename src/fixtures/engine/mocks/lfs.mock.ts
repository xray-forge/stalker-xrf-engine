import { jest } from "@jest/globals";

export const mockLfs = {
  mkdir: jest.fn(),
  dir: jest.fn(() => [null, () => null]),
};
