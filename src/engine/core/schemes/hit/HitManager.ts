import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeHitState } from "@/engine/core/schemes/hit/ISchemeHitState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { ClientObject, EScheme, Optional, TCount, TIndex, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class HitManager extends AbstractSchemeManager<ISchemeHitState> {
  /**
   * todo: Description.
   */
  public override onHit(
    object: ClientObject,
    amount: TCount,
    localDirection: Vector,
    who: Optional<ClientObject>,
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
