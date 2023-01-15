import { XR_game_object, XR_ini_file } from "xray16";

import { AnyObject } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("schemes");

export const stype_stalker = 0;
export const stype_mobile = 1;
export const stype_item = 2;
export const stype_heli = 3;
export const stype_restrictor = 4;

export const schemes: LuaTable<string, string | AnyObject> = new LuaTable();
export const stypes: LuaTable<string, number> = new LuaTable();

export interface ISchemeClass {
  add_to_binder(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string, storage: IStoredObject): void;
  set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string, gulag_name: string): void;
}

export function loadScheme(filenameOrModule: string | ISchemeClass, scheme: string, stype: number): void {
  log.info("Loading scheme:", scheme, stype);

  schemes.set(scheme, filenameOrModule);
  stypes.set(scheme, stype);
}
