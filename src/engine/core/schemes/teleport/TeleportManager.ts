import { level, patrol, sound_object, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import {
  ETeleportState,
  ISchemeTeleportState,
  ITeleportPoint,
} from "@/engine/core/schemes/teleport/ISchemeTeleportState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { sounds } from "@/engine/lib/constants/sound/sounds";
import { ClientObject, Optional, TDuration, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class TeleportManager extends AbstractSchemeManager<ISchemeTeleportState> {
  public teleportState: ETeleportState = ETeleportState.IDLE;
  public timer: Optional<TDuration> = null;

  /**
   * todo: Description.
   */
  public override update(): void {
    const actor: Optional<ClientObject> = registry.actor;

    if (!actor) {
      return;
    }

    if (this.teleportState === ETeleportState.IDLE) {
      if (this.object.inside(actor.position())) {
        this.teleportState = ETeleportState.ACTIVATED;
        this.timer = time_global();
        level.add_pp_effector(postProcessors.teleport, 2006, false);
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
   * todo: Description.
   */
  public teleportActor(actor: ClientObject, teleportPoint: ITeleportPoint): void {
    logger.info("Teleporting actor:", teleportPoint.point);

    const pointPatrolVector: Vector = new patrol(teleportPoint.point).point(0);
    const lookDirectionVector: Vector = new patrol(teleportPoint.look).point(0).sub(pointPatrolVector);

    actor.set_actor_position(pointPatrolVector);
    actor.set_actor_direction(-lookDirectionVector.getH());

    new sound_object(sounds.affects_tinnitus3a).play_no_feedback(actor, sound_object.s2d, 0, createEmptyVector(), 1.0);
  }
}
