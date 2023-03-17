import { TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { Optional, TCount } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function giveInfo(infoId?: Optional<TInfoPortion>): void {
  logger.info("Give alife info:", infoId);

  if (infoId) {
    registry.actor.give_info_portion(infoId);
  }
}

/**
 * todo;
 */
export function disableInfo(infoId?: Optional<TInfoPortion>): void {
  logger.info("Disable alife info:", infoId);

  if (infoId && hasAlifeInfo(infoId)) {
    registry.actor.disable_info_portion(infoId);
  }
}

/**
 * Whether actor has alife info active.
 */
export function hasAlifeInfo(infoId?: Optional<TInfoPortion>): infoId is TInfoPortion {
  if (!infoId || !registry.actor) {
    return false;
  }

  return registry.actor.has_info(infoId);
}

/**
 * Whether actor has all alife info from the list.
 * @param infoIds - array of infos to check.
 */
export function hasAlifeInfos(infoIds: Array<TInfoPortion>): boolean {
  return hasFewAlifeInfos(infoIds, infoIds.length);
}

/**
 * Whether actor has at least one alife info from the list.
 * @param infoIds - array of infos to check.
 */
export function hasAtLeastOneAlifeInfo(infoIds: Array<TInfoPortion>): boolean {
  return hasFewAlifeInfos(infoIds, 1);
}

/**
 * Whether actor has alife infos from the list.
 * @param infoIds - array of infos to check.
 * @param count - count of infos required to satisfy conditions.
 */
export function hasFewAlifeInfos(infoIds: Array<TInfoPortion>, count: TCount): boolean {
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
