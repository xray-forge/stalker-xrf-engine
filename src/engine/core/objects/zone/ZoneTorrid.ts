import { cse_torrid_zone, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Torrid zone server representation.
 */
@LuabindClass()
export class ZoneTorrid extends cse_torrid_zone {
  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    EventsManager.emitEvent(EGameEvent.ZONE_REGISTERED, this);
    EventsManager.emitEvent(EGameEvent.TORRID_ZONE_REGISTERED, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.TORRID_ZONE_UNREGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ZONE_UNREGISTERED, this);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }
}
