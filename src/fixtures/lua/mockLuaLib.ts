import { mockLuaExtensions } from "@/fixtures/lua/mocks/lua_extensions.mocks";
import { mockLuaGlobals } from "@/fixtures/lua/mocks/lua_globals.mocks";

/**
 * Mock global lua libs.
 */
export function mockLuaLib(): void {
  mockLuaGlobals();
  mockLuaExtensions();
}
