import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/hit_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { EScheme, GameObject, Optional, TCount, TIndex, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class HitManager extends AbstractSchemeManager<ISchemeHitState> {
  public override onHit(
    object: GameObject,
    amount: TCount,
    localDirection: Vector,
    who: Optional<GameObject>,
    boneIndex: TIndex
  ): void {
    // todo: Probably play around with this and avoid this external refs. this.state?
    const state: ISchemeHitState = registry.objects.get(this.object.id())[EScheme.HIT] as ISchemeHitState;

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
