import { IBaseSchemeLogic, ILogicsOverrides, IRegistryObjectState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { getServerObjectByStoryId } from "@/engine/core/database/story_objects";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { abort } from "@/engine/core/utils/assertion";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
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
import { EMPTY_LUA_ARRAY } from "@/engine/lib/constants/data";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { NEVER, NIL } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ESchemeCondition,
  GameObject,
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

/**
 * Parse array of `|` separated condition lists.
 * Original regexp - "(%|*[^%|]+%|*)%p*".
 *
 * @param object - game object
 * @param data - target data list string to parse
 * @returns parsed list of sections from processed condition lists
 */
export function getSectionsFromConditionLists(object: GameObject, data: Optional<string>): LuaArray<TInfoPortion> {
  const infos: LuaArray<TInfoPortion> = new LuaTable();
  const actor: GameObject = registry.actor;

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
 * @param actor - actor game object
 * @param object - game object
 * @param condlist - target condlist to process
 * @returns picked section based on condlist and actual checks
 */
export function pickSectionFromCondList<T extends TSection>(
  actor: GameObject,
  object: Optional<GameObject | ServerObject>,
  condlist: TConditionList
): Optional<T> {
  for (const [, switchCondition] of condlist) {
    let areInfoPortionConditionsMet: boolean = true;

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

        if (condition(actor, object, configCondition.params ?? EMPTY_LUA_ARRAY)) {
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
      } else if (configCondition.name && hasInfoPortion(configCondition.name)) {
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

          effect(actor, object, configCondition.params ?? EMPTY_LUA_ARRAY);
        } else if (configCondition.required) {
          if (configCondition.name && !hasInfoPortion(configCondition.name)) {
            giveInfoPortion(configCondition.name as TName);
          }
        } else {
          if (configCondition.name && hasInfoPortion(configCondition.name)) {
            disableInfoPortion(configCondition.name);
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
      const serverObject: Optional<ServerObject> = getServerObjectByStoryId(target.p1 as TStringId);

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
 * @param object - game object
 * @returns overrides object
 */
export function getObjectConfigOverrides(ini: IniFile, section: TSection, object: GameObject): ILogicsOverrides {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const heliHunter: Optional<string> = readIniString(ini, section, "heli_hunter", false);
  const [minPostCombatTime, maxPostCombatTime] = readIniTwoNumbers(
    ini,
    ini.line_exist(state.sectionLogic, "post_combat_time") ? state.sectionLogic : section,
    "post_combat_time",
    combatConfig.POST_COMBAT_IDLE.MIN,
    combatConfig.POST_COMBAT_IDLE.MAX
  );

  return {
    combatType: readIniConditionList(ini, section, "combat_type"),
    scriptCombatType: null,
    heliHunter: heliHunter ? parseConditionsList(heliHunter) : null,
    maxPostCombatTime: maxPostCombatTime,
    minPostCombatTime: minPostCombatTime,
    onCombat: readIniConditionList(ini, section, "on_combat"),
    onOffline: parseConditionsList(
      readIniString(
        ini,
        ini.line_exist(section, "on_offline") ? section : state.sectionLogic,
        "on_offline",
        false,
        null,
        NIL
      )
    ),
    soundgroup: readIniString(ini, section, "soundgroup", false),
    combatIgnore: readIniConditionList(ini, section, "combat_ignore_cond"),
    combatIgnoreKeepWhenAttacked: readIniBoolean(ini, section, "combat_ignore_keep_when_attacked", false),
  };
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
    const mask: string = "^" + cond + "%d*$";

    for (const lineNumber of $range(0, linesCount - 1)) {
      const [, key] = ini.r_line(section, lineNumber, "", "");
      const [searchIndex] = string.find(key, mask);

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
