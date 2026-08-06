import { TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
import { onItemWeaponGoOnlineFirstTime } from "@/engine/extensions/enhanced_items_drop/enhanced_items_drop_utils";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Enhanced items drop (with upgrades)";
export const enabled: boolean = false;

/**
 * Enable extension.
 * Start listening weapon going online first time and add random upgrades for non-trader NPCs.
 */
export function register(): void {
  logger.info("Enhanced treasures activated");

  const eventsManager: EventsManager = getManager(EventsManager);

  eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, onItemWeaponGoOnlineFirstTime);
}
