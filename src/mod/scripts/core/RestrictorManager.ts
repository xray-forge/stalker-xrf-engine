import { XR_game_object, XR_ini_file } from "xray16";

import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { getConfigString, getParamString, parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("RestrictorManager");

export class RestrictorManager {
  public static forNpc(npc: XR_game_object): RestrictorManager {
    log.info("Get restrictor manager for npc:", npc.name());

    const st: IStoredObject = storage.get(npc.id());

    if (st.restrictor_manager === null) {
      st.restrictor_manager = new RestrictorManager(npc);
    }

    return st.restrictor_manager!;
  }

  public object: XR_game_object;
  public base_out_restrictions: LuaTable<string, boolean>;
  public base_in_restrictions: LuaTable<string, boolean>;

  public in_restrictions: LuaTable<number, string>;
  public out_restrictions: LuaTable<number, string>;

  public constructor(object: XR_game_object) {
    this.object = object;
    this.base_out_restrictions = new LuaTable();
    this.base_in_restrictions = new LuaTable();
    this.out_restrictions = parseNames(this.object.out_restrictions());

    for (const [k, v] of this.out_restrictions) {
      this.base_out_restrictions.set(v, true);
    }

    this.in_restrictions = parseNames(this.object.in_restrictions());

    for (const [k, v] of this.in_restrictions) {
      this.base_in_restrictions.set(v, true);
    }
  }

  public reset_restrictions(st: IStoredObject, section: string): void {
    log.info("Reset restrictions:", this.object.name(), section);

    const actual_ini: XR_ini_file = st.ini!;
    const [out_restr_string] = getParamString(
      getConfigString(actual_ini, section, "out_restr", null, false, "", ""),
      this.object
    );

    const new_out_restr = parseNames(out_restr_string);
    const old_out_restr = parseNames(this.object.out_restrictions());
    let ins_restr: LuaTable<number, string> = new LuaTable();
    let del_restr: LuaTable<number, string> = new LuaTable();

    // todo: Intersection with 2x2 loop.
    for (const [k, v] of old_out_restr) {
      let exist_rest = false;

      for (const [kk, vv] of new_out_restr) {
        if (v == vv) {
          exist_rest = true;
          break;
        }
      }

      if (exist_rest === false && this.base_out_restrictions.get(v) !== true) {
        table.insert(del_restr, v);
      }
    }

    for (const [k, v] of new_out_restr) {
      let exist_rest = false;

      for (const [kk, vv] of old_out_restr) {
        if (v === vv) {
          exist_rest = true;
          break;
        }
      }

      if (exist_rest === false && v !== "nil") {
        table.insert(ins_restr, v);
      }
    }

    for (const [k, v] of del_restr) {
      this.object.remove_restrictions(v, "");
    }

    for (const [k, v] of ins_restr) {
      this.object.add_restrictions(v, "");
    }

    const [in_restr_string] = getParamString(
      getConfigString(actual_ini, section, "in_restr", null, false, "", ""),
      this.object
    );
    const new_in_restr = parseNames(in_restr_string);
    const old_in_restr = parseNames(this.object.in_restrictions());

    ins_restr = new LuaTable();
    del_restr = new LuaTable();

    for (const [k, v] of old_in_restr) {
      let exist_rest: boolean = false;

      for (const [kk, vv] of new_in_restr) {
        if (v === vv) {
          exist_rest = true;
          break;
        }
      }

      if (exist_rest == false && this.base_in_restrictions.get(v) !== true) {
        table.insert(del_restr, v);
      }
    }

    for (const [k, v] of new_in_restr) {
      let exist_rest: boolean = false;

      for (const [kk, vv] of old_in_restr) {
        if (v === vv) {
          exist_rest = true;
          break;
        }
      }

      if (exist_rest === false && v !== "nil") {
        table.insert(ins_restr, v);
      }
    }

    for (const [k, v] of del_restr) {
      this.object.remove_restrictions("", v);
    }

    for (const [k, v] of ins_restr) {
      this.object.add_restrictions("", v);
    }
  }
}
