import { AnyObject } from "@/mod/lib/types";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("schemes");

// Todo: Enum and constant in each binder.
export const stype_stalker = 0;
export const stype_mobile = 1;
export const stype_item = 2;
export const stype_heli = 3;
export const stype_restrictor = 4;

export enum ESchemeType {
  STALKER = 0,
  MOBILE = 1,
  ITEM = 2,
  HELI = 3,
  RESTRICTOR = 4
}

export const schemes: LuaTable<string, string | AnyObject> = new LuaTable();
export const stypes: LuaTable<string, number> = new LuaTable();

export function loadScheme(
  filenameOrModule: string | typeof AbstractSchemeAction,
  scheme: string,
  stype: ESchemeType
): void {
  log.info("Loading scheme:", scheme, ESchemeType[1]);

  schemes.set(scheme, filenameOrModule);
  stypes.set(scheme, stype);
}
