import { jest } from "@jest/globals";

export const mockMarshal = {
  encode: jest.fn((data) => {
    if (data instanceof LuaTable) {
      return JSON.stringify($fromLuaTable(data));
    }

    return JSON.stringify(data);
  }),
  decode: jest.fn((data: string) => JSON.parse(data)),
};
