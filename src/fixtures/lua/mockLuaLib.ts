import { jest } from "@jest/globals";
import {
  mockDebug,
  mockIo,
  mockJit,
  MockLuaMap,
  MockLuaTable,
  mockMath,
  mockRange,
  mockString,
  mockTable,
  mockTonumber,
  mockToString,
  mockType,
} from "xray16/mocks";

export function mockLuaGlobals(): void {
  // @ts-expect-error
  globalThis._G = globalThis;
  // @ts-expect-error
  globalThis._VERSION = "fengari-jest";
  // @ts-expect-error
  globalThis.LuaMap = MockLuaMap;
  // @ts-expect-error
  globalThis.LuaTable = MockLuaTable;
  // @ts-expect-error
  globalThis.string = mockString;
  // @ts-expect-error
  globalThis.table = mockTable;
  // @ts-expect-error
  globalThis.math = mockMath;
  // @ts-expect-error
  globalThis.debug = mockDebug;
  // @ts-expect-error
  globalThis.io = mockIo;
  // @ts-expect-error
  globalThis.jit = mockJit;

  // @ts-expect-error
  globalThis.$range = jest.fn(mockRange);
  // @ts-expect-error
  globalThis.$multi = (...args: Array<unknown>) => [...args];

  // @ts-expect-error
  globalThis.tonumber = jest.fn(mockTonumber);
  globalThis.tostring = jest.fn(mockToString);
  // @ts-expect-error
  globalThis.collectgarbage = jest.fn(() => 1024);
  // @ts-expect-error
  globalThis.type = jest.fn(mockType);
  // @ts-expect-error
  globalThis.pairs = jest.fn((target: object) => Object.entries(target));
  // @ts-expect-error
  globalThis.ipairs = jest.fn((target: object) => Object.entries(target));
  // @ts-expect-error
  globalThis.error = jest.fn((message: string): string => {
    throw new Error(message);
  });
}
