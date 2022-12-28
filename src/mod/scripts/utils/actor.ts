import { alife, XR_alife_simulator } from "xray16";

import { getActor } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/actor");

/**
 * todo;
 */
export function giveInfo(infoId: string): void {
  log.info("Give alife info:", infoId);
  getActor()!.give_info_portion(infoId);
}

/**
 * todo;
 */
export function disableInfo(infoId: string): void {
  if (hasAlifeInfo(infoId)) {
    getActor()!.disable_info_portion(infoId);
  }
}

/**
 * todo;
 */
export function hasAlifeInfo(infoId: string): boolean {
  const sim: XR_alife_simulator = alife();

  if (sim === null) {
    return false;
  }

  return sim.has_info(0, infoId);
}
