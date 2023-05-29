import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getParamString } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseStringsList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class ObjectRestrictionsManager {
  /**
   * todo: Description.
   */
  public static initializeForObject(object: ClientObject): ObjectRestrictionsManager {
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
  public static resetForObject(object: ClientObject, state: IRegistryObjectState, section: TSection): void {
    return ObjectRestrictionsManager.initializeForObject(object).reset(state, section);
  }

  public object: ClientObject;
  public baseOutRestrictions: LuaTable<string, boolean>;
  public baseInRestrictions: LuaTable<string, boolean>;

  public inRestrictions: LuaTable<number, string>;
  public outRestrictions: LuaTable<number, string>;

  public constructor(object: ClientObject) {
    this.object = object;
    this.baseOutRestrictions = new LuaTable();
    this.baseInRestrictions = new LuaTable();
    this.outRestrictions = parseStringsList(this.object.out_restrictions());

    for (const [k, v] of this.outRestrictions) {
      this.baseOutRestrictions.set(v, true);
    }

    this.inRestrictions = parseStringsList(this.object.in_restrictions());

    for (const [k, v] of this.inRestrictions) {
      this.baseInRestrictions.set(v, true);
    }
  }

  /**
   * todo: Description.
   */
  public reset(state: IRegistryObjectState, section: TSection): void {
    logger.info("Reset restrictions:", this.object.name(), section);

    const actualIni: IniFile = state.ini!;
    const [outRestrString] = getParamString(readIniString(actualIni, section, "out_restr", false, "", ""));

    const newOutRestr = parseStringsList(outRestrString);
    const oldOutRestr = parseStringsList(this.object.out_restrictions());
    let insRestr: LuaTable<number, string> = new LuaTable();
    let delRestr: LuaTable<number, string> = new LuaTable();

    // todo: Intersection with 2x2 loop.
    for (const [k, v] of oldOutRestr) {
      let existRest = false;

      for (const [kk, vv] of newOutRestr) {
        if (v === vv) {
          existRest = true;
          break;
        }
      }

      if (existRest === false && this.baseOutRestrictions.get(v) !== true) {
        table.insert(delRestr, v);
      }
    }

    for (const [k, v] of newOutRestr) {
      let existRest = false;

      for (const [kk, vv] of oldOutRestr) {
        if (v === vv) {
          existRest = true;
          break;
        }
      }

      if (existRest === false && v !== NIL) {
        table.insert(insRestr, v);
      }
    }

    for (const [k, v] of delRestr) {
      this.object.remove_restrictions(v, "");
    }

    for (const [k, v] of insRestr) {
      this.object.add_restrictions(v, "");
    }

    const [inRestrString] = getParamString(readIniString(actualIni, section, "in_restr", false, "", ""));
    const newInRestr = parseStringsList(inRestrString);
    const oldInRestr = parseStringsList(this.object.in_restrictions());

    insRestr = new LuaTable();
    delRestr = new LuaTable();

    for (const [k, v] of oldInRestr) {
      let existRest: boolean = false;

      for (const [kk, vv] of newInRestr) {
        if (v === vv) {
          existRest = true;
          break;
        }
      }

      if (existRest === false && this.baseInRestrictions.get(v) !== true) {
        table.insert(delRestr, v);
      }
    }

    for (const [k, v] of newInRestr) {
      let existRest: boolean = false;

      for (const [kk, vv] of oldInRestr) {
        if (v === vv) {
          existRest = true;
          break;
        }
      }

      if (existRest === false && v !== NIL) {
        table.insert(insRestr, v);
      }
    }

    for (const [k, v] of delRestr) {
      this.object.remove_restrictions("", v);
    }

    for (const [k, v] of insRestr) {
      this.object.add_restrictions("", v);
    }
  }
}
