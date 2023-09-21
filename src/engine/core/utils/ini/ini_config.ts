import { registry } from "@/engine/core/database/registry";
import { getServerObjectByStoryId } from "@/engine/core/database/story_objects";
import { IBaseSchemeLogic, IRegistryObjectState } from "@/engine/core/database/types";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import {
  readIniBoolean,
  readIniConditionList,
  readIniNumberAndConditionList,
  readIniString,
  readIniStringAndCondList,
  readIniTwoNumbers,
  readIniTwoStringsAndConditionsList,
} from "@/engine/core/utils/ini/ini_read";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { NEVER, NIL } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ClientObject,
  ESchemeCondition,
  IniFile,
  LuaArray,
  Optional,
  ServerObject,
  TCount,
  TIndex,
  TName,
  TProbability,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Parse array of `|` separated condition lists.
 * Original regexp - "(%|*[^%|]+%|*)%p*".
 *
 * @param object - target client object
 * @param data - target data list string to parse
 * @returns parsed list of sections from processed condition lists
 */
export function getSectionsFromConditionLists(object: ClientObject, data: Optional<string>): LuaArray<TInfoPortion> {
  const infos: LuaArray<TInfoPortion> = new LuaTable();
  const actor: ClientObject = registry.actor;

  if (data !== null) {
    // todo: Trim parsed.
    for (const name of string.gfind(data, "%s*([^|]+)%s*")) {
      const conditionsList: Optional<TConditionList> = parseConditionsList(name);

      if (conditionsList !== null) {
        table.insert(infos, pickSectionFromCondList(actor, object, conditionsList) as TInfoPortion);
      }
    }
  }

  return infos;
}

/**
 * Pick resulting scheme based on info portions and xr_conditions requirements.
 * Process side effects of such checks and give needed infos and call effects on switch.
 *
 * todo: Implement static condlists and check performance without parsing etc.
 *
 * @param actor - actor client object
 * @param object - target client object
 * @param condlist - target condlist to process
 * @returns picked section based on condlist and actual checks
 */
export function pickSectionFromCondList<T extends TSection>(
  actor: ClientObject,
  object: Optional<ClientObject | ServerObject>,
  condlist: TConditionList
): Optional<T> {
  for (const [, switchCondition] of condlist) {
    let areInfoPortionConditionsMet = true;

    for (const [, configCondition] of switchCondition.infop_check) {
      if (configCondition.prob) {
        const randomValue: TProbability = math.random(100);

        if (configCondition.prob < randomValue) {
          areInfoPortionConditionsMet = false;
          break;
        }
      } else if (configCondition.func) {
        const condition: Optional<AnyCallable> = (_G as AnyObject)["xr_conditions"][configCondition.func];

        if (!condition) {
          abort(
            "object '%s': pickSectionFromCondList: function '%s' is not defined in xr_conditions.",
            object?.name(),
            configCondition.func
          );
        }

        if (condition(actor, object, configCondition.params)) {
          if (!configCondition.expected) {
            areInfoPortionConditionsMet = false;
            break;
          }
        } else {
          if (configCondition.expected) {
            areInfoPortionConditionsMet = false;
            break;
          }
        }
      } else if (configCondition.name && hasAlifeInfo(configCondition.name)) {
        if (!configCondition.required) {
          areInfoPortionConditionsMet = false;
          break;
        } else {
          // -
        }
      } else {
        if (configCondition.required) {
          areInfoPortionConditionsMet = false;
          break;
        } else {
          // -
        }
      }
    }

    if (areInfoPortionConditionsMet) {
      for (const [, configCondition] of switchCondition.infop_set) {
        if (configCondition.func) {
          const effect: Optional<AnyCallable> = (_G as AnyObject)["xr_effects"][configCondition.func];

          if (!effect) {
            abort(
              "object '%s': pickSectionFromCondList: function '%s' is not defined in xr_effects.",
              object?.name(),
              configCondition.func
            );
          }

          effect(actor, object, configCondition.params);
        } else if (configCondition.required) {
          if (configCondition.name && !hasAlifeInfo(configCondition.name)) {
            giveInfo(configCondition.name as TName);
          }
        } else {
          if (configCondition.name && hasAlifeInfo(configCondition.name)) {
            disableInfo(configCondition.name);
          }
        }
      }

      return switchCondition.section === NEVER ? null : (switchCondition.section as T);
    }
  }

  return null;
}

/**
 * Parse config field containing zone name, story ID and condlist.
 * Example: `zat_cop_id|zat_b38_actor_jump_down|walker@get_out`.
 *
 * @param ini - target ini file to read
 * @param section - target section to read
 * @param field - section field name to read
 * @returns parse scheme logic descriptor
 */
export function getConfigObjectAndZone(ini: IniFile, section: TSection, field: TName): Optional<IBaseSchemeLogic> {
  const target: Optional<IBaseSchemeLogic> = readIniTwoStringsAndConditionsList(ini, section, field);

  if (target) {
    if (registry.simulator !== null) {
      const serverObject: Optional<ServerObject> = getServerObjectByStoryId(target.p1 as string);

      if (serverObject) {
        target.objectId = serverObject.id;
      } else {
        abort("Section '%s': field '%s': there is no object with story_id '%s'", section, field, target.p1);
      }
    } else {
      target.objectId = -1;
    }
  }

  return target;
}

/**
 * Get config overrides from object logics section.
 *
 * @param ini - target ini file
 * @param section - section name to read from ini file
 * @param object - target client object
 * @returns overrides object
 */
export function getObjectConfigOverrides(ini: IniFile, section: TSection, object: ClientObject): AnyObject {
  const overrides: AnyObject = {};
  const heliHunter: Optional<string> = readIniString(ini, section, "heli_hunter", false);

  if (heliHunter !== null) {
    overrides.heli_hunter = parseConditionsList(heliHunter);
  }

  overrides.combat_ignore = readIniConditionList(ini, section, "combat_ignore_cond");
  overrides.combat_ignore_keep_when_attacked = readIniBoolean(ini, section, "combat_ignore_keep_when_attacked", false);
  overrides.combat_type = readIniConditionList(ini, section, "combat_type");
  overrides.on_combat = readIniConditionList(ini, section, "on_combat");

  const state: IRegistryObjectState = registry.objects.get(object.id());

  // todo: use ternary for state.section_logic
  if (ini.line_exist(state.sectionLogic, "post_combat_time")) {
    const [minPostCombatTime, maxPostCombatTime] = readIniTwoNumbers(
      ini,
      state.sectionLogic,
      "post_combat_time",
      logicsConfig.POST_COMBAT_IDLE.MIN / 1000,
      logicsConfig.POST_COMBAT_IDLE.MAX / 1000
    );

    overrides.min_post_combat_time = minPostCombatTime;
    overrides.max_post_combat_time = maxPostCombatTime;
  } else {
    const [min_post_combat_time, max_post_combat_time] = readIniTwoNumbers(
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
    overrides.on_offline_condlist = parseConditionsList(readIniString(ini, section, "on_offline", false, null, NIL));
  } else {
    overrides.on_offline_condlist = parseConditionsList(
      readIniString(ini, state.sectionLogic, "on_offline", false, null, NIL)
    );
  }

  overrides.soundgroup = readIniString(ini, section, "soundgroup", false);

  return overrides;
}

/**
 * Get switch conditions for provided scheme section like `mob_home@2`.
 * Parses all possible switch cases for checking and switching later if conditions are satisfied.
 *
 * @param ini - target ini config file
 * @param section - section in ini file to read
 * @return optional list of scheme logic switcher descriptors
 */
export function getConfigSwitchConditions(ini: IniFile, section: TSection): Optional<LuaArray<IBaseSchemeLogic>> {
  const conditionsList: LuaArray<IBaseSchemeLogic> = new LuaTable();

  if (!ini.section_exist(tostring(section))) {
    return null;
  }

  const linesCount: TCount = ini.line_count(section);
  let index: TIndex = 1;

  /**
   * todo;
   */
  function addConditions(
    func: (ini: IniFile, section: TSection, id: TStringId) => Optional<IBaseSchemeLogic>,
    cond: ESchemeCondition
  ): void {
    for (const lineNumber of $range(0, linesCount - 1)) {
      const [, key] = ini.r_line(section, lineNumber, "", "");
      const [searchIndex] = string.find(key, "^" + cond + "%d*$");

      if (searchIndex !== null) {
        index = addConditionToList(conditionsList, index, func(ini, section, key));
      }
    }
  }

  // todo: Move conditions to enum/switcher object?
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN);
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN_NOT_VISIBLE);
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN);
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN_NOT_VISIBLE);
  addConditions(readIniStringAndCondList, ESchemeCondition.ON_SIGNAL);
  addConditions(readIniConditionList, ESchemeCondition.ON_INFO);
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_TIMER);
  addConditions(readIniNumberAndConditionList, ESchemeCondition.ON_GAME_TIMER);
  addConditions(readIniStringAndCondList, ESchemeCondition.ON_ACTOR_IN_ZONE);
  addConditions(readIniStringAndCondList, ESchemeCondition.ON_ACTOR_NOT_IN_ZONE);
  addConditions(readIniConditionList, ESchemeCondition.ON_ACTOR_INSIDE);
  addConditions(readIniConditionList, ESchemeCondition.ON_ACTOR_OUTSIDE);
  addConditions(getConfigObjectAndZone, ESchemeCondition.ON_NPC_IN_ZONE);
  addConditions(getConfigObjectAndZone, ESchemeCondition.ON_NPC_NOT_IN_ZONE);

  return conditionsList;
}

/**
 * Add condition to list.
 *
 * @param conditionsList - list to insert new scheme
 * @param at - index to insert at
 * @param conditionScheme - scheme to insert in list
 * @returns index where next element should be inserted
 */
export function addConditionToList(
  conditionsList: LuaArray<IBaseSchemeLogic>,
  at: TIndex,
  conditionScheme: Optional<IBaseSchemeLogic>
): TIndex {
  if (conditionScheme) {
    conditionsList.set(at, conditionScheme);

    return at + 1;
  }

  return at;
}
