import { XR_game_object, XR_vector } from "xray16";

import { Optional, TCount, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeHitState } from "@/mod/scripts/core/schemes/hit/ISchemeHitState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeHit");

/**
 * todo;
 */
export class HitManager extends AbstractSchemeManager<ISchemeHitState> {
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
    registry.objects.get(this.object.id()).hit.bone_index = boneIndex;

    if (amount === 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      logger.info("Object hit:", object.name(), "<-", who.name(), amount);

      registry.objects.get(object.id()).hit.who = who.id();
    } else {
      logger.info("Object hit:", object.name(), "<-", "unknown", amount);
      registry.objects.get(object.id()).hit.who = -1;
    }

    if (registry.objects.get(this.object.id()).active_scheme) {
      registry.objects.get(this.object.id()).hit.deadly_hit = amount >= this.object.health * 100;

      if (trySwitchToAnotherSection(object, registry.objects.get(this.object.id()).hit, registry.actor)) {
        registry.objects.get(this.object.id()).hit.deadly_hit = false;

        return;
      }

      registry.objects.get(this.object.id()).hit.deadly_hit = false;
    }
  }
}
