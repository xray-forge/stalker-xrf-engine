import { alife, cse_alife_item_artefact, LuabindClass, XR_cse_alife_creature_actor } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ItemArtefact extends cse_alife_item_artefact {
  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    registerObjectStoryLinks(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override can_switch_offline(): boolean {
    const actor: Optional<XR_cse_alife_creature_actor> = alife()?.actor();

    // todo: Is it needed?
    // todo: if so, move 150 to config
    if (actor !== null && actor.position.distance_to(this.position) <= 150) {
      return false;
    }

    return super.can_switch_offline();
  }
}
