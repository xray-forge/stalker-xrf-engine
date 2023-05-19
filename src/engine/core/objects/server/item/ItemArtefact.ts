import { alife, cse_alife_item_artefact, LuabindClass, XR_cse_alife_creature_actor } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Artefact item representation.
 */
@LuabindClass()
export class ItemArtefact extends cse_alife_item_artefact {
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  public override can_switch_offline(): boolean {
    const actor: Optional<XR_cse_alife_creature_actor> = alife()?.actor();

    if (actor !== null && actor.position.distance_to(this.position) <= logicsConfig.ARTEFACT_OFFLINE_DISTANCE) {
      return false;
    }

    return super.can_switch_offline();
  }
}
