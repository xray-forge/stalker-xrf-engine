import { alife, XR_alife_simulator } from "xray16";

import { TInfoPortion } from "@/mod/globals/info_portions/info_portions";
import { registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("actor");

/**
 * todo;
 */
export function giveInfo(infoId: string): void {
  logger.info("Give alife info:", infoId);
  registry.actor.give_info_portion(infoId);
}

/**
 * todo;
 */
export function disableInfo(infoId: string): void {
  logger.info("Disable alife info:", infoId);

  if (hasAlifeInfo(infoId)) {
    registry.actor.disable_info_portion(infoId);
  }
}

/**
 * Whether actor has alife info active.
 */
export function hasAlifeInfo(infoId: string): boolean {
  const sim: XR_alife_simulator = alife();

  if (sim === null) {
    return false;
  }

  return sim.has_info(0, infoId);
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
export function hasFewAlifeInfos(infoIds: Array<TInfoPortion>, count: number): boolean {
  const sim: XR_alife_simulator = alife();

  if (sim === null) {
    return false;
  }

  let activeInfos: number = 0;

  for (let it = 0; it < infoIds.length; it++) {
    if (sim.has_info(0, infoIds[it])) {
      activeInfos += 1;

      if (activeInfos >= count) {
        return true;
      }
    }
  }

  return false;
}
