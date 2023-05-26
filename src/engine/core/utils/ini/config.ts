import { alife, alife_simulator, cse_alife_object, game_object, ini_file } from "xray16";

import { getObjectIdByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { IBaseSchemeLogic } from "@/engine/core/schemes";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { getExtern } from "@/engine/core/utils/binding";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import {
  addCondition,
  getConfigNumberAndConditionList,
  getConfigStringAndConditionList,
  getConfigTwoStringsAndConditionsList,
  getTwoNumbers,
  readIniBoolean,
  readIniConditionList,
  readIniString,
} from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { NIL } from "@/engine/lib/constants/words";
import {
  AnyCallablesModule,
  AnyObject,
  ESchemeCondition,
  LuaArray,
  Optional,
  TCount,
  TIndex,
  TName,
  TRate,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function getParamString(data: string): LuaMultiReturn<[string, boolean]> {
  const [outString, num] = string.gsub(data, "%$script_id%$", NIL);

  if (num > 0) {
    return $multi(outString, true);
  } else {
    return $multi(data, false);
  }
}

/**
 * todo;
 */
export function getInfosFromData(object: game_object, data: Optional<string>): LuaArray<TInfoPortion> {
  const infos: LuaArray<TInfoPortion> = new LuaTable();
  const actor: game_object = registry.actor;

  if (data !== null) {
    for (const name of string.gfind(data, "(%|*[^%|]+%|*)%p*")) {
      const conditionsList: Optional<TConditionList> = parseConditionsList(name);

      if (conditionsList !== null) {
        table.insert(infos, pickSectionFromCondList(actor, object, conditionsList) as TInfoPortion);
      }
    }
  }

  return infos;
}

/**
 * @returns picked section based on condlist.
 */
export function pickSectionFromCondList<T extends TSection>(
  actor: game_object,
  object: Optional<game_object | cse_alife_object>,
  condlist: TConditionList
): Optional<T> {
  let randomValue: Optional<TRate> = null; // -- math.random(100)
  let infop_conditions_met;

  for (const [n, cond] of condlist) {
    infop_conditions_met = true;
    for (const [inum, infop] of pairs(cond.infop_check)) {
      if (infop.prob) {
        if (!randomValue) {
          randomValue = math.random(100);
        }

        if (infop.prob < randomValue) {
          infop_conditions_met = false;
          break;
        }
      } else if (infop.func) {
        if (!getExtern<AnyCallablesModule>("xr_conditions")[infop.func]) {
          abort(
            "object '%s': pick_section_from_condlist: function '%s' is " + "not defined in xr_conditions.script",
            object?.name(),
            infop.func
          );
        }

        if (infop.params) {
          if (getExtern<AnyCallablesModule>("xr_conditions")[infop.func](actor, object, infop.params)) {
            if (!infop.expected) {
              infop_conditions_met = false;
              break;
            }
          } else {
            if (infop.expected) {
              infop_conditions_met = false;
              break;
            }
          }
        } else {
          if (getExtern<AnyCallablesModule>("xr_conditions")[infop.func](actor, object)) {
            if (!infop.expected) {
              infop_conditions_met = false;
              break;
            }
          } else {
            if (infop.expected) {
              infop_conditions_met = false;
              break;
            }
          }
        }
      } else if (hasAlifeInfo(infop.name)) {
        if (!infop.required) {
          infop_conditions_met = false;
          break;
        } else {
          // -
        }
      } else {
        if (infop.required) {
          infop_conditions_met = false;
          break;
        } else {
          // -
        }
      }
    }

    if (infop_conditions_met) {
      for (const [inum, infop] of pairs(cond.infop_set)) {
        assertDefined(actor, "Trying to set infos when actor is not initialized.");

        if (infop.func) {
          if (!getExtern<AnyCallablesModule>("xr_effects")[infop.func]) {
            abort(
              "object '%s': pick_section_from_condlist: function '%s' is " + "not defined in xr_effects.script",
              object?.name(),
              infop.func
            );
          }

          if (infop.params) {
            getExtern<AnyCallablesModule>("xr_effects")[infop.func](actor, object, infop.params);
          } else {
            getExtern<AnyCallablesModule>("xr_effects")[infop.func](actor, object);
          }
        } else if (infop.required) {
          if (!hasAlifeInfo(infop.name)) {
            giveInfo(infop.name);
          }
        } else {
          if (hasAlifeInfo(infop.name)) {
            disableInfo(infop.name);
          }
        }
      }

      if (cond.section === "never") {
        return null;
      } else {
        return cond.section as T;
      }
    }
  }

  return null;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function getConfigObjectAndZone(ini: ini_file, section: TSection, field: TName): Optional<IBaseSchemeLogic> {
  const target: Optional<IBaseSchemeLogic> = getConfigTwoStringsAndConditionsList(ini, section, field);

  if (target !== null) {
    const simulator: Optional<alife_simulator> = alife();

    if (simulator !== null) {
      const serverObject: Optional<cse_alife_object> = simulator.object(getObjectIdByStoryId(target.v1 as string)!);

      if (serverObject) {
        target.npc_id = serverObject.id;
      } else {
        abort("Section '%s': field '%s': there is no object with story_id '%s'", section, field, target.v1);
      }
    } else {
      target.npc_id = -1;
    }
  }

  return target;
}

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function getObjectConfigOverrides(ini: ini_file, section: TSection, object: game_object): AnyObject {
  const overrides: AnyObject = {};
  const heliHunter: Optional<string> = readIniString(ini, section, "heli_hunter", false, "");

  if (heliHunter !== null) {
    overrides.heli_hunter = parseConditionsList(heliHunter);
  }

  overrides.combat_ignore = readIniConditionList(ini, section, "combat_ignore_cond");
  overrides.combat_ignore_keep_when_attacked = readIniBoolean(ini, section, "combat_ignore_keep_when_attacked", false);
  overrides.combat_type = readIniConditionList(ini, section, "combat_type");
  overrides.on_combat = readIniConditionList(ini, section, "on_combat");

  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (ini.line_exist(state.section_logic, "post_combat_time")) {
    const [min_post_combat_time, max_post_combat_time] = getTwoNumbers(
      ini,
      state.section_logic,
      "post_combat_time",
      logicsConfig.POST_COMBAT_IDLE.MIN / 1000,
      logicsConfig.POST_COMBAT_IDLE.MAX / 1000
    );

    overrides.min_post_combat_time = min_post_combat_time;
    overrides.max_post_combat_time = max_post_combat_time;
  } else {
    const [min_post_combat_time, max_post_combat_time] = getTwoNumbers(
      ini,
      section,
      "post_combat_time",
      logicsConfig.POST_COMBAT_IDLE.MIN / 1000,
      logicsConfig.POST_COMBAT_IDLE.MAX / 1000
    );

    overrides.min_post_combat_time = min_post_combat_time;
    overrides.max_post_combat_time = max_post_combat_time;
  }

  if (ini.line_exist(section, "on_offline")) {
    overrides.on_offline_condlist = parseConditionsList(readIniString(ini, section, "on_offline", false, "", NIL));
  } else {
    overrides.on_offline_condlist = parseConditionsList(
      readIniString(ini, state.section_logic, "on_offline", false, "", NIL)
    );
  }

  overrides.soundgroup = readIniString(ini, section, "soundgroup", false, "");

  return overrides;
}

/**
 * todo
 * todo
 * todo
 */
export function getConfigSwitchConditions(ini: ini_file, section: TSection): Optional<LuaArray<IBaseSchemeLogic>> {
  const conditionsList: LuaArray<IBaseSchemeLogic> = new LuaTable();
  let index: TIndex = 1;

  if (!ini.section_exist(tostring(section))) {
    return null;
  }

  const linesCount: TCount = ini.line_count(section);

  function add_conditions(
    func: (ini: ini_file, section: TSection, id: TStringId) => Optional<IBaseSchemeLogic>,
    cond: ESchemeCondition
  ) {
    for (const line_number of $range(0, linesCount - 1)) {
      const [, id, value] = ini.r_line(section, line_number, "", "");
      const [search_index] = string.find(id, "^" + cond + "%d*$");

      if (search_index !== null) {
        index = addCondition(conditionsList, index, func(ini, section, id));
      }
    }
  }

  // todo: Move conditions to enum.
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN);
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN_AND_VISIBLE);
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN);
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN_AND_VISIBLE);
  add_conditions(getConfigStringAndConditionList, ESchemeCondition.ON_SIGNAL);
  add_conditions(readIniConditionList, ESchemeCondition.ON_INFO);
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_TIMER);
  add_conditions(getConfigNumberAndConditionList, ESchemeCondition.ON_GAME_TIMER);
  add_conditions(getConfigStringAndConditionList, ESchemeCondition.ON_ACTOR_IN_ZONE);
  add_conditions(getConfigStringAndConditionList, ESchemeCondition.ON_ACTOR_NOT_IN_ZONE);
  add_conditions(readIniConditionList, ESchemeCondition.ON_ACTOR_INSIDE);
  add_conditions(readIniConditionList, ESchemeCondition.ON_ACTOR_OUTSIDE);
  add_conditions(getConfigObjectAndZone, ESchemeCondition.ON_NPC_IN_ZONE);
  add_conditions(getConfigObjectAndZone, ESchemeCondition.ON_NPC_NOT_IN_ZONE);

  return conditionsList;
}
