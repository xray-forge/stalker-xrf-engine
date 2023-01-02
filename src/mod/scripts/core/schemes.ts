import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("schemes");

export const stype_stalker = 0;
export const stype_mobile = 1;
export const stype_item = 2;
export const stype_heli = 3;
export const stype_restrictor = 4;

export const schemes: LuaTable<string, string> = new LuaTable();
export const stypes: LuaTable<string, number> = new LuaTable();

export function loadScheme(filename: string, scheme: string, stype: number): void {
  log.info("Loading scheme:", filename, stype);

  schemes.set(scheme, filename);
  stypes.set(scheme, stype);
}
