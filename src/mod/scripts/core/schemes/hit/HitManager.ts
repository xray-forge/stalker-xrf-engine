import { XR_game_object, XR_vector } from "xray16";

import { EScheme, Optional, TCount, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeHitState } from "@/mod/scripts/core/schemes/hit/ISchemeHitState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("HitManager");

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
    // todo: Probably play around with this and avoid this external refs. this.state?
    const state: ISchemeHitState = registry.objects.get(this.object.id())[EScheme.HIT] as ISchemeHitState;

    state.bone_index = boneIndex;

    if (amount === 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      state.who = who.id();
    } else {
      state.who = -1;
    }

    if (registry.objects.get(this.object.id()).active_scheme) {
      state.deadly_hit = amount >= this.object.health * 100;

      if (trySwitchToAnotherSection(object, state, registry.actor)) {
        state.deadly_hit = false;

        return;
      }

      state.deadly_hit = false;
    }
  }
}
