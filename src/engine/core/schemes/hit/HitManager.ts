import { XR_game_object, XR_vector } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeHitState } from "@/engine/core/schemes/hit/ISchemeHitState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, Optional, TCount, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
