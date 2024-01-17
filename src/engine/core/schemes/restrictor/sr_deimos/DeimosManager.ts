import { level, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ActorBinder } from "@/engine/core/binders/creature/ActorBinder";
import { getManager, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { deimosConfig } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosConfig";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
import { isBlackScreen } from "@/engine/core/utils/game";
import { clamp } from "@/engine/core/utils/number";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyObject, GameObject, Optional, TIndex, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class DeimosManager extends AbstractSchemeManager<ISchemeDeimosState> {
  public phase: TIndex = 0;
  public effectorActivatedAt: TTimestamp = 0;

  public update(): void {
    const actor: Optional<GameObject> = registry.actor;
    const soundManager: SoundManager = getManager(SoundManager);

    if (!actor || isBlackScreen()) {
      return;
    }

    if ((actor as unknown as ActorBinder).deimosIntensity) {
      this.state.intensity = (actor as AnyObject).deimosIntensity;
      (actor as unknown as ActorBinder).deimosIntensity = null;

      if (this.state.intensity > this.state.disableBound) {
        level.add_pp_effector(this.state.ppEffector + ".ppe", deimosConfig.POST_PROCESS_EFFECTOR_ID, true);
        soundManager.playLooped(ACTOR_ID, this.state.noiseSound);
        this.phase = 1;
      }

      if (this.state.intensity > this.state.switchLowerBound) {
        soundManager.playLooped(ACTOR_ID, this.state.heartbeatSound);
        this.phase = 2;
      }
    }

    const currentSpeed: TRate = actor.get_movement_speed().magnitude();
    let intensityDelta: TRate = (this.state.movementSpeed - currentSpeed) * 0.005;

    intensityDelta *= intensityDelta > 0 ? this.state.growingRate : this.state.loweringRate;

    this.state.intensity = clamp(this.state.intensity + intensityDelta, 0, 1);

    const ppIntensity: TRate = this.state.intensity;
    const noiseIntensity: TRate = this.state.intensity;
    const heartbeatIntensity: TRate = this.state.intensity;

    if (this.phase > 0) {
      level.set_pp_effector_factor(deimosConfig.POST_PROCESS_EFFECTOR_ID, ppIntensity);
      soundManager.setLoopedSoundVolume(ACTOR_ID, this.state.noiseSound, noiseIntensity);

      if (this.phase > 1) {
        soundManager.setLoopedSoundVolume(ACTOR_ID, this.state.heartbeatSound, heartbeatIntensity);
      }
    }

    if (intensityDelta > 0) {
      if (this.state.intensity > this.state.switchUpperBound) {
        const now: TTimestamp = time_global();

        if (now - this.effectorActivatedAt > this.state.camEffectorRepeatingTime) {
          this.effectorActivatedAt = now;

          level.add_cam_effector(
            `camera_effects\\${this.state.camEffector}.anm`,
            deimosConfig.CAMERA_EFFECTOR_ID,
            false,
            ""
          );
          level.add_pp_effector(
            `${this.state.ppEffector2}.ppe`,
            deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID,
            false
          );
          actor.health = -this.state.healthLost;
        }
      } else if (this.state.intensity > this.state.switchLowerBound) {
        if (this.phase < 2) {
          soundManager.playLooped(ACTOR_ID, this.state.heartbeatSound);
          soundManager.setLoopedSoundVolume(ACTOR_ID, this.state.heartbeatSound, heartbeatIntensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disableBound) {
        if (this.phase < 1) {
          level.add_pp_effector(`${this.state.ppEffector}.ppe`, deimosConfig.POST_PROCESS_EFFECTOR_ID, true);
          level.set_pp_effector_factor(deimosConfig.POST_PROCESS_EFFECTOR_ID, ppIntensity);
          soundManager.playLooped(ACTOR_ID, this.state.noiseSound);
          soundManager.setLoopedSoundVolume(ACTOR_ID, this.state.noiseSound, noiseIntensity);
          this.phase = 1;
        }
      }
    } else {
      if (this.state.intensity < this.state.disableBound) {
        if (this.phase > 0) {
          soundManager.stopLooped(ACTOR_ID, this.state.noiseSound);
          level.remove_pp_effector(deimosConfig.POST_PROCESS_EFFECTOR_ID);
          this.phase = 0;
        }
      } else if (this.state.intensity < this.state.switchLowerBound) {
        if (this.phase > 1) {
          soundManager.stopLooped(ACTOR_ID, this.state.heartbeatSound);
          this.phase = 1;
        }
      } else if (this.state.intensity < this.state.switchUpperBound) {
        level.remove_cam_effector(deimosConfig.CAMERA_EFFECTOR_ID);
        level.remove_pp_effector(deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID);
      }
    }

    // Try to stop deimos phase on every iteration.
    // Dispose and stop all the effects and sounds on stop.
    if (trySwitchToAnotherSection(this.object, this.state)) {
      this.reset();
    }
  }

  /**
   * Reset effectors and sounds related to deimos.
   */
  public reset(): void {
    if (this.phase > 0) {
      const soundManager: SoundManager = getManager(SoundManager);

      soundManager.stopLooped(ACTOR_ID, this.state.noiseSound);
      level.remove_pp_effector(deimosConfig.POST_PROCESS_EFFECTOR_ID);

      if (this.phase > 1) {
        soundManager.stopLooped(ACTOR_ID, this.state.heartbeatSound);
        level.remove_cam_effector(deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID);
        level.remove_pp_effector(deimosConfig.CAMERA_EFFECTOR_ID);
      }
    }
  }
}
