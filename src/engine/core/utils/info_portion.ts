import { registry } from "@/engine/core/database/registry";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "info_portions", mode: ELuaLoggerMode.DUAL });

/**
 * Give info portion to actor.
 *
 * @param infoId - info portion to give to actor
 */
export function giveInfoPortion(infoId: TName): void {
  logger.info("Give info portion:", infoId);

  registry.actor.give_info_portion(infoId);
}

/**
 * Disable actor info portion.
 *
 * @param infoId - info portion to disable
 */
export function disableInfoPortion(infoId: TName): void {
  logger.info("Disable alife info:", infoId);

  if (registry.actor?.has_info(infoId)) {
    registry.actor.disable_info_portion(infoId);
  }
}

/**
 * Whether actor has info portion set.
 * Fallbacks to false if actor is not registered.
 *
 * @returns whether actor has info portion set already
 */
export function hasInfoPortion(infoId: TName): infoId is TInfoPortion {
  if (registry.actor === null) {
    return false;
  }

  return registry.actor.has_info(infoId);
}

/**
 * Whether actor has all alife info from the list.
 *
 * @param infoIds - array of infos to check
 * @returns whether actor has info portions active
 */
export function hasInfoPortions(infoIds: Array<TName>): boolean {
  return hasFewInfoPortions(infoIds, table.size(infoIds));
}

/**
 * Whether actor has at least one alife info from the list.
 *
 * @param infoIds - array of infos to check
 * @returns whether actor has at least one info portion from list
 */
export function hasAtLeastOneInfoPortion(infoIds: Array<TName>): boolean {
  return hasFewInfoPortions(infoIds, 1);
}

/**
 * Whether actor has alife infos from the list.
 *
 * @param infoIds - array of infos to check
 * @param count - count of infos required to satisfy conditions
 * @returns whether actor has few of required info portions
 */
export function hasFewInfoPortions(infoIds: Array<TName>, count: TCount): boolean {
  let activeInfos: TCount = 0;

  for (let it = 0; it < infoIds.length; it++) {
    if (registry.actor.has_info(infoIds[it])) {
      activeInfos += 1;

      if (activeInfos >= count) {
        return true;
      }
    }
  }

  return false;
}
