import { level, patrol, sound_object, time_global, vector, XR_game_object, XR_vector } from "xray16";

import { post_processors } from "@/engine/globals/animation/post_processors";
import { sounds } from "@/engine/globals/sound/sounds";
import { Optional, TCount, TDuration } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import {
  ETeleportState,
  ISchemeTeleportState,
  ITeleportPoint,
} from "@/engine/scripts/core/schemes/teleport/ISchemeTeleportState";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class TeleportManager extends AbstractSchemeManager<ISchemeTeleportState> {
  public teleportState: ETeleportState = ETeleportState.IDLE;
  public timer: Optional<TDuration> = null;

  /**
   * todo;
   */
  public override update(): void {
    const actor: Optional<XR_game_object> = registry.actor;

    if (!actor) {
      return;
    }

    if (this.teleportState === ETeleportState.IDLE) {
      if (this.object.inside(actor.position())) {
        this.teleportState = ETeleportState.ACTIVATED;
        this.timer = time_global();
        level.add_pp_effector(post_processors.teleport, 2006, false);
        // --set_postprocess("scripts\\teleport.ltx")
      }
    }

    if (this.teleportState === ETeleportState.ACTIVATED) {
      if (time_global() - this.timer! >= this.state.timeout!) {
        const temp: LuaTable<number, ITeleportPoint> = new LuaTable();
        let maxRandom: number = 0;

        for (const [k, v] of this.state.points!) {
          temp.set(k, v);
          maxRandom = maxRandom + v.prob;
        }

        let probability: number = math.random(0, maxRandom);

        for (const [k, teleportPoint] of temp) {
          probability = probability - teleportPoint.prob;
          if (probability <= 0) {
            this.teleportActor(actor, teleportPoint);
            break;
          }
        }

        this.teleportState = ETeleportState.IDLE;
      } else {
        return;
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      return;
    }
  }

  /**
   * todo;
   */
  public teleportActor(actor: XR_game_object, teleportPoint: ITeleportPoint): void {
    logger.info("Teleporting actor:", teleportPoint.point);

    const pointPatrolVector: XR_vector = new patrol(teleportPoint.point).point(0);
    const lookDirectionVector: XR_vector = new patrol(teleportPoint.look).point(0).sub(pointPatrolVector);

    actor.set_actor_position(pointPatrolVector);
    actor.set_actor_direction(-lookDirectionVector.getH());

    new sound_object(sounds.affects_tinnitus3a).play_no_feedback(actor, sound_object.s2d, 0, new vector(), 1.0);
  }
}
