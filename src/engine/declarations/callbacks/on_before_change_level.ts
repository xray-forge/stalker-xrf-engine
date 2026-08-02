import { NetPacket } from "xray16/alias";
import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle the event before a level change. */
extern("CALifeUpdateManager__on_before_change_level", (packet: NetPacket) => {
  logger.info("On before level change callback");
  EventsManager.emitEvent(EGameEvent.BEFORE_LEVEL_CHANGE, packet);
});
