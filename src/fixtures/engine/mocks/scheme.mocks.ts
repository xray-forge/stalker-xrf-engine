import { AbstractSchemeManager, IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes";
import { IConfigSwitchCondition, TConditionList } from "@/engine/core/utils/ini/types";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockIniFile } from "@/fixtures/xray";

/**
 * Mock generic scheme state.
 */
export function mockSchemeState<T extends IBaseSchemeState>(
  object: ClientObject,
  scheme: EScheme,
  base: Partial<T> = {}
): T {
  return {
    ...(base as T),
    idle_end: 0,
    ini: base.ini || mockIniFile("scheme.ltx"),
    logic: new LuaTable(),
    npc: object,
    overrides: null,
    scheme: base.scheme || scheme,
    section: base.section || scheme + "@test",
    signals: new LuaTable(),
  };
}

/**
 * Mock generic conditions.
 */
export function mockCondition(base: Partial<IConfigSwitchCondition> = {}): IConfigSwitchCondition {
  return {
    ...base,
    section: base.section || "true",
    infop_check: base.infop_check || new LuaTable(),
    infop_set: base.infop_check || new LuaTable(),
  };
}

/**
 * Mock whole condlist.
 */
export function mockCondlist(...conditions: Array<IConfigSwitchCondition>): TConditionList {
  const list: TConditionList = new LuaTable();

  conditions.forEach((it) => table.insert(list, it));

  return list;
}

/**
 * Mock generic scheme logic.
 */
export function mockBaseSchemeLogic(base: Partial<IBaseSchemeLogic> = {}): IBaseSchemeLogic {
  return {
    ...base,
    name: base.name || "base-name",
    condlist: base.condlist || new LuaTable(),
    npc_id: base.npc_id || null,
    v1: base.v1 || null,
    v2: base.v2 || null,
  };
}

/**
 * Get generic subscriber to scheme actions.
 */
export function getSchemeAction<S extends IBaseSchemeState, T extends AbstractSchemeManager<S>>(state: S): T {
  return (state.actions as unknown as MockLuaTable<T, boolean>).getKeysArray()[0];
}
