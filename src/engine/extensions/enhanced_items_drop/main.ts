import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
import { onItemGoOnlineFirstTime } from "@/engine/extensions/enhanced_items_drop/enhanced_items_drop_utils";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Enhanced items drop (with upgrades)";
export const enabled: boolean = false;

/**
 * Enable extension.
 * Start listening item going online first time and add random upgrades.
 */
export function register(): void {
  logger.info("Enhanced treasures activated");

  const eventsManager: EventsManager = getManager(EventsManager);

  eventsManager.registerCallback(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, onItemGoOnlineFirstTime);
  eventsManager.registerCallback(EGameEvent.ITEM_OUTFIT_GO_ONLINE_FIRST_TIME, onItemGoOnlineFirstTime);
  eventsManager.registerCallback(EGameEvent.ITEM_HELMET_GO_ONLINE_FIRST_TIME, onItemGoOnlineFirstTime);
}
