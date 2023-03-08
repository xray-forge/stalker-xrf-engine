import { XR_game_object, XR_vector } from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { Optional, TCount, TIndex, TName } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalOnHitState } from "@/mod/scripts/core/schemes/ph_on_hit/ISchemePhysicalOnHitState";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PhysicalHitManager");

/**
 * todo;
 */
export class PhysicalOnHitManager extends AbstractSchemeManager<ISchemePhysicalOnHitState> {
  /**
   * todo;
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    boneIndex: TIndex
  ): void {
    const whoName: TName = who ? who.name() : STRINGIFIED_NIL;

    logger.info("Object hit:", object.name(), "<-", whoName, amount);

    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
