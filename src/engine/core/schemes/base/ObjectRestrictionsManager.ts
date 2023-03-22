import { XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getParamString } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseStringsList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class ObjectRestrictionsManager {
  /**
   * todo: Description.
   */
  public static initializeForObject(object: XR_game_object): ObjectRestrictionsManager {
    logger.info("Get restrictor manager for object:", object.name());

    const state: IRegistryObjectState = registry.objects.get(object.id());

    if (state.restrictionsManager === null) {
      state.restrictionsManager = new ObjectRestrictionsManager(object);
    }

    return state.restrictionsManager!;
  }

  /**
   * todo: Description.
   */
  public static resetForObject(object: XR_game_object, state: IRegistryObjectState, section: TSection): void {
    return ObjectRestrictionsManager.initializeForObject(object).reset(state, section);
  }

  public object: XR_game_object;
  public base_out_restrictions: LuaTable<string, boolean>;
  public base_in_restrictions: LuaTable<string, boolean>;

  public in_restrictions: LuaTable<number, string>;
  public out_restrictions: LuaTable<number, string>;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object) {
    this.object = object;
    this.base_out_restrictions = new LuaTable();
    this.base_in_restrictions = new LuaTable();
    this.out_restrictions = parseStringsList(this.object.out_restrictions());

    for (const [k, v] of this.out_restrictions) {
      this.base_out_restrictions.set(v, true);
    }

    this.in_restrictions = parseStringsList(this.object.in_restrictions());

    for (const [k, v] of this.in_restrictions) {
      this.base_in_restrictions.set(v, true);
    }
  }

  /**
   * todo: Description.
   */
  public reset(state: IRegistryObjectState, section: TSection): void {
    logger.info("Reset restrictions:", this.object.name(), section);

    const actual_ini: XR_ini_file = state.ini!;
    const [out_restr_string] = getParamString(
      readIniString(actual_ini, section, "out_restr", false, "", ""),
      this.object
    );

    const new_out_restr = parseStringsList(out_restr_string);
    const old_out_restr = parseStringsList(this.object.out_restrictions());
    let ins_restr: LuaTable<number, string> = new LuaTable();
    let del_restr: LuaTable<number, string> = new LuaTable();

    // todo: Intersection with 2x2 loop.
    for (const [k, v] of old_out_restr) {
      let exist_rest = false;

      for (const [kk, vv] of new_out_restr) {
        if (v === vv) {
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

      if (exist_rest === false && v !== NIL) {
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
      readIniString(actual_ini, section, "in_restr", false, "", ""),
      this.object
    );
    const new_in_restr = parseStringsList(in_restr_string);
    const old_in_restr = parseStringsList(this.object.in_restrictions());

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

      if (exist_rest === false && this.base_in_restrictions.get(v) !== true) {
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

      if (exist_rest === false && v !== NIL) {
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
