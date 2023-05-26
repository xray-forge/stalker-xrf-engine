import { device, game_object, level, time_global, vector } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ActorBinder } from "@/engine/core/objects/binders/creature/ActorBinder";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeDeimosState } from "@/engine/core/schemes/sr_deimos/ISchemeDeimosState";
import { clampNumber } from "@/engine/core/utils/number";
import { AnyObject, Optional, TIndex, TNumberId, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class DeimosManager extends AbstractSchemeManager<ISchemeDeimosState> {
  public static readonly POST_PROCESS_EFFECTOR_ID: TNumberId = 5;
  public static readonly POST_PROCESS_EFFECTOR_SECONDARY_ID: TNumberId = 7;
  public static readonly CAMERA_EFFECTOR_ID: TNumberId = 6;

  public cameraEffectorActivatedAt: TTimestamp = 0;
  public phase: TIndex = 0;

  /**
   * todo: Description.
   */
  public constructor(object: game_object, state: ISchemeDeimosState) {
    super(object, state);

    this.state.intensity = 0;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const actor: Optional<game_object> = registry.actor;
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (!actor || device().precache_frame > 1) {
      return;
    }

    const actorId: TNumberId = actor.id();

    if ((actor as unknown as ActorBinder).deimosIntensity) {
      this.state.intensity = (actor as AnyObject).deimosIntensity;
      (actor as unknown as ActorBinder).deimosIntensity = null;

      if (this.state.intensity > this.state.disable_bound) {
        level.add_pp_effector(this.state.pp_effector + ".ppe", DeimosManager.POST_PROCESS_EFFECTOR_ID, true);
        globalSoundManager.playLoopedSound(actorId, this.state.noise_sound);
        this.phase = 1;
      }

      if (this.state.intensity > this.state.switch_lower_bound) {
        globalSoundManager.playLoopedSound(actorId, this.state.heartbeet_sound);
        this.phase = 2;
      }
    }

    const vec: vector = actor.get_movement_speed();
    const cur_speed: number = math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    let intensity_delta: number = (this.state.movement_speed - cur_speed) * 0.005;

    if (intensity_delta > 0) {
      intensity_delta = this.state.growing_koef * intensity_delta;
    } else {
      intensity_delta = this.state.lowering_koef * intensity_delta;
    }

    this.state.intensity = clampNumber(this.state.intensity + intensity_delta, 0, 1);

    const pp_intensity = this.state.intensity;
    const noise_intensity = this.state.intensity;
    const heartbeet_intensity = this.state.intensity;

    if (this.phase > 0) {
      level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, pp_intensity);
      globalSoundManager.setLoopedSoundVolume(actorId, this.state.noise_sound, noise_intensity);

      if (this.phase > 1) {
        globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeet_sound, heartbeet_intensity);
      }
    }

    if (intensity_delta > 0) {
      if (this.state.intensity > this.state.switch_upper_bound) {
        const now: TTimestamp = time_global();

        if (now - this.cameraEffectorActivatedAt > this.state.cam_effector_repeating_time) {
          this.cameraEffectorActivatedAt = now;
          level.add_cam_effector(
            "camera_effects\\" + this.state.cam_effector + ".anm",
            DeimosManager.CAMERA_EFFECTOR_ID,
            false,
            ""
          );
          level.add_pp_effector(
            this.state.pp_effector2 + ".ppe",
            DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID,
            false
          );
          actor.health = -this.state.health_lost;
        }
      } else if (this.state.intensity > this.state.switch_lower_bound) {
        if (this.phase < 2) {
          globalSoundManager.playLoopedSound(actorId, this.state.heartbeet_sound);
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeet_sound, heartbeet_intensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disable_bound) {
        if (this.phase < 1) {
          level.add_pp_effector(this.state.pp_effector + ".ppe", DeimosManager.POST_PROCESS_EFFECTOR_ID, true);
          level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, pp_intensity);
          globalSoundManager.playLoopedSound(actorId, this.state.noise_sound);
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.noise_sound, noise_intensity);
          this.phase = 1;
        }
      }
    } else {
      if (this.state.intensity < this.state.disable_bound) {
        if (this.phase > 0) {
          globalSoundManager.stopLoopedSound(actorId, this.state.noise_sound);
          level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_ID);
          this.phase = 0;
        }
      } else if (this.state.intensity < this.state.switch_lower_bound) {
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actorId, this.state.heartbeet_sound);
          this.phase = 1;
        }
      } else if (this.state.intensity < this.state.switch_upper_bound) {
        level.remove_cam_effector(DeimosManager.CAMERA_EFFECTOR_ID);
        level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID);
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      if (this.phase > 0) {
        globalSoundManager.stopLoopedSound(actorId, this.state.noise_sound);
        level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_ID);
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actorId, this.state.heartbeet_sound);
          level.remove_cam_effector(DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID);
          level.remove_pp_effector(DeimosManager.CAMERA_EFFECTOR_ID);
        }
      }

      return;
    }
  }
}
