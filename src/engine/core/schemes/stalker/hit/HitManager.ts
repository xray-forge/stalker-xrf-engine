import { GameObject, Vector } from "xray16/alias";
import { Nillable, TCount, TIndex } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/hit_types";
import { getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Manager of object hit events.
 */
export class HitManager extends AbstractSchemeManager<ISchemeHitState> {
  public override onHit(
    object: GameObject,
    amount: TCount,
    localDirection: Vector,
    who: Nillable<GameObject>,
    boneIndex: TIndex
  ): void {
    // todo: Probably play around with this and avoid this external refs. this.state?
    const state: ISchemeHitState = getSchemeStateOptimistic(registry.objects.get(this.object.id()), EScheme.HIT);

    state.boneIndex = boneIndex;

    if (amount === 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      state.who = who.id();
    } else {
      state.who = -1;
    }

    if (registry.objects.get(this.object.id()).activeScheme) {
      state.isDeadlyHit = amount >= this.object.health * 100;

      if (trySwitchToAnotherSection(object, state)) {
        state.isDeadlyHit = false;

        return;
      }

      state.isDeadlyHit = false;
    }
  }
}
