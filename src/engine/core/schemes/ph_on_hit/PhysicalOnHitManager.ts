import { XR_game_object, XR_vector } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/ph_on_hit/ISchemePhysicalOnHitState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TCount, TIndex, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalOnHitManager extends AbstractSchemeManager<ISchemePhysicalOnHitState> {
  /**
   * todo: Description.
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    boneIndex: TIndex
  ): void {
    const whoName: TName = who ? who.name() : NIL;

    logger.info("Object hit:", object.name(), "<-", whoName, amount);

    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
