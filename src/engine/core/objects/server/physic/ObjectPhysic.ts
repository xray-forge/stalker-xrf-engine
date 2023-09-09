import { cse_alife_object_physic, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TreasureManager } from "@/engine/core/managers/world/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generic physic object representation on server side.
 * Represents static model in game world.
 *
 * Examples:
 * - Static artefacts in scientist bunker
 * - Detectors to place in anomaly by quest
 *
 * todo: Rename to PhysicObject to match c++.
 */
@LuabindClass()
export class ObjectPhysic extends cse_alife_object_physic {
  public isSecretItem: Optional<boolean> = false;

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    this.isSecretItem = TreasureManager.registerItem(this);
    EventsManager.emitEvent(EGameEvent.OBJECT_PHYSIC_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.OBJECT_PHYSIC_UNREGISTER, this);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override keep_saved_data_anyway(): boolean {
    return true;
  }

  public override can_switch_online(): boolean {
    if (this.isSecretItem) {
      return false;
    }

    return super.can_switch_online();
  }
}
