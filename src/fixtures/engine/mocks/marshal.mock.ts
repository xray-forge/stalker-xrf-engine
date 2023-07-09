import { jest } from "@jest/globals";

export const mockMarshal = {
  encode: jest.fn((data) => JSON.stringify(data)),
  decode: jest.fn((data: string) => JSON.parse(data)),
};
