import { AnyObject } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("schemes");

export const stype_stalker = 0;
export const stype_mobile = 1;
export const stype_item = 2;
export const stype_heli = 3;
export const stype_restrictor = 4;

export const schemes: LuaTable<string, string | AnyObject> = new LuaTable();
export const stypes: LuaTable<string, number> = new LuaTable();

export function loadScheme(filenameOrModule: string | AnyObject, scheme: string, stype: number): void {
  log.info("Loading scheme:", scheme, stype);

  schemes.set(scheme, filenameOrModule);
  stypes.set(scheme, stype);
}
