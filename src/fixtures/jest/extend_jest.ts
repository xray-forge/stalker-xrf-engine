import { expect } from "@jest/globals";

import {
  toEqualLuaArrays,
  toEqualLuaTables,
  toStrictEqualLuaArrays,
  toStrictEqualLuaTables,
} from "@/fixtures/jest/matchers";

/**
 * Add custom matchers to jest for simpler testing.
 */
export function extendJest(): void {
  expect.extend({
    toEqualLuaArrays,
    toEqualLuaTables,
    toStrictEqualLuaArrays,
    toStrictEqualLuaTables,
  });
}
