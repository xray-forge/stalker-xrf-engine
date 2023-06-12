import { IBaseSchemeState } from "@/engine/core/schemes";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockIniFile } from "@/fixtures/xray";

/**
 * Mock generic scheme state.
 */
export function mockSchemeState<T extends IBaseSchemeState>(object: ClientObject, base: Partial<T> = {}): T {
  return {
    ...(base as T),
    idle_end: 0,
    ini: base.ini || mockIniFile("scheme.ltx"),
    logic: new LuaTable(),
    npc: object,
    overrides: null,
    scheme: base.scheme || EScheme.PH_IDLE,
    section: base.section || EScheme.PH_IDLE + "@test",
    signals: new LuaTable(),
  };
}
