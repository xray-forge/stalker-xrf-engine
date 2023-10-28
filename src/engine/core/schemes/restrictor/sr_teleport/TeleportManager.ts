import { level, patrol, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ETeleportState, ISchemeTeleportState } from "@/engine/core/schemes/restrictor/sr_teleport/sr_teleport_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { teleportActorWithEffects } from "@/engine/core/utils/position";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { postProcessors } from "@/engine/lib/constants/animation";
import { GameObject, Optional, TProbability, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Implement smooth teleportation with sound/animation on contact with restrictor zones.
 */
export class TeleportManager extends AbstractSchemeManager<ISchemeTeleportState> {
  public teleportState: ETeleportState = ETeleportState.IDLE;
  public timer: TTimestamp = 0;

  public update(): void {
    const actor: Optional<GameObject> = registry.actor;
    const now: TTimestamp = time_global();

    if (!actor) {
      return;
    }

    // Start teleportation and show visual effects.
    if (this.teleportState === ETeleportState.IDLE) {
      if (this.object.inside(actor.position())) {
        this.teleportState = ETeleportState.ACTIVATED;
        this.timer = now;

        level.add_pp_effector(postProcessors.teleport, 2006, false);
      }
    }

    // Actually teleport to one of positions.
    if (this.teleportState === ETeleportState.ACTIVATED) {
      if (now - this.timer >= this.state.timeout) {
        let probability: TProbability = math.random(0, this.state.maxTotalProbability);

        for (const [, teleportPoint] of this.state.points) {
          probability -= teleportPoint.probability;

          if (probability <= 0) {
            const position: Vector = new patrol(teleportPoint.point).point(0);
            const direction: Vector = new patrol(teleportPoint.look).point(0).sub(position);

            teleportActorWithEffects(actor, position, direction);
            break;
          }
        }

        this.teleportState = ETeleportState.IDLE;
      } else {
        return;
      }
    }

    trySwitchToAnotherSection(this.object, this.state);
  }
}
