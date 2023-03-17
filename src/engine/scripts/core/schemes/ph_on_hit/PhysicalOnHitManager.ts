import { XR_game_object, XR_vector } from "xray16";

import { STRINGIFIED_NIL } from "@/engine/globals/lua";
import { Optional, TCount, TIndex, TName } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalOnHitState } from "@/engine/scripts/core/schemes/ph_on_hit/ISchemePhysicalOnHitState";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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
