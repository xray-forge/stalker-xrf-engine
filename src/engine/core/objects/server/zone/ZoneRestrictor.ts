import { cse_alife_space_restrictor, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Restriction control zone representation.
 */
@LuabindClass()
export class ZoneRestrictor extends cse_alife_space_restrictor {
  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    EventsManager.emitEvent(EGameEvent.ZONE_REGISTERED, this);
    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_REGISTERED, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_UNREGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ZONE_UNREGISTERED, this);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }
}
