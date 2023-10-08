import { jest } from "@jest/globals";

export const mockLfs = {
  mkdir: jest.fn(),
  attributes: jest.fn(() => null),
  dir: jest.fn(() => [null, () => null]),
};
