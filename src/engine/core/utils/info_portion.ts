import { registry } from "@/engine/core/database/registry";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "info_portions", mode: ELuaLoggerMode.DUAL });

/**
 * Give info portion to actor.
 *
 * @param name - info portion to give to actor
 */
export function giveInfoPortion(name: TName): void {
  logger.info("Give info portion:", name);

  registry.actor.give_info_portion(name);
}

/**
 * Disable actor info portion.
 *
 * @param name - info portion to disable
 */
export function disableInfoPortion(name: TName): void {
  logger.info("Disable info portion:", name);

  if (registry.actor?.has_info(name)) {
    registry.actor.disable_info_portion(name);
  }
}

/**
 * Whether actor has info portion set.
 * Fallbacks to false if actor is not registered.
 *
 * @returns whether actor has info portion set already
 */
export function hasInfoPortion(name: TName): name is TInfoPortion {
  if (registry.actor === null) {
    return false;
  }

  return registry.actor.has_info(name);
}

/**
 * Whether actor has all alife info from the list.
 *
 * @param names - array of infos to check
 * @returns whether actor has info portions active
 */
export function hasInfoPortions(names: Array<TName>): boolean {
  return hasFewInfoPortions(names, table.size(names));
}

/**
 * Whether actor has at least one alife info from the list.
 *
 * @param names - array of infos to check
 * @returns whether actor has at least one info portion from list
 */
export function hasAtLeastOneInfoPortion(names: Array<TName>): boolean {
  return hasFewInfoPortions(names, 1);
}

/**
 * Whether actor has alife infos from the list.
 *
 * @param names - array of infos to check
 * @param count - count of infos required to satisfy conditions
 * @returns whether actor has few of required info portions
 */
export function hasFewInfoPortions(names: Array<TName>, count: TCount): boolean {
  let activeInfos: TCount = 0;

  for (let it = 0; it < names.length; it++) {
    if (registry.actor.has_info(names[it])) {
      activeInfos += 1;

      if (activeInfos >= count) {
        return true;
      }
    }
  }

  return false;
}
