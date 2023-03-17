import { device, level, time_global, XR_game_object, XR_vector } from "xray16";

import { AnyObject, Optional, TCount, TNumberId } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { ActorBinder } from "@/engine/scripts/core/objects/binders/ActorBinder";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeDeimosState } from "@/engine/scripts/core/schemes/sr_deimos/ISchemeDeimosState";
import { clampNumber } from "@/engine/scripts/utils/number";

const pp_effector_id: TNumberId = 5;
const cam_effector_id: TNumberId = 6;
const pp_effector2_id: TNumberId = 7;

/**
 * todo;
 */
export class DeimosManager extends AbstractSchemeManager<ISchemeDeimosState> {
  public cam_effector_time: TCount = 0;
  public phase: number = 0;

  /**
   * todo;
   */
  public constructor(object: XR_game_object, state: ISchemeDeimosState) {
    super(object, state);

    this.state.intensity = 0;
  }

  /**
   * todo;
   */
  public override update(): void {
    const actor: Optional<XR_game_object> = registry.actor;
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (!actor || device().precache_frame > 1) {
      return;
    }

    const actorId: number = actor.id();

    if ((actor as unknown as ActorBinder).deimos_intensity) {
      this.state.intensity = (actor as AnyObject).deimos_intensity;
      (actor as unknown as ActorBinder).deimos_intensity = null;

      if (this.state.intensity > this.state.disable_bound) {
        level.add_pp_effector(this.state.pp_effector + ".ppe", pp_effector_id, true);
        globalSoundManager.playLoopedSound(actorId, this.state.noise_sound);
        this.phase = 1;
      }

      if (this.state.intensity > this.state.switch_lower_bound) {
        globalSoundManager.playLoopedSound(actorId, this.state.heartbeet_sound);
        this.phase = 2;
      }
    }

    const vec: XR_vector = actor.get_movement_speed();
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
      level.set_pp_effector_factor(pp_effector_id, pp_intensity);
      globalSoundManager.setLoopedSoundVolume(actorId, this.state.noise_sound, noise_intensity);

      if (this.phase > 1) {
        globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeet_sound, heartbeet_intensity);
      }
    }

    if (intensity_delta > 0) {
      if (this.state.intensity > this.state.switch_upper_bound) {
        const cur_time = time_global();

        if (cur_time - this.cam_effector_time > this.state.cam_effector_repeating_time) {
          this.cam_effector_time = time_global();
          level.add_cam_effector("camera_effects\\" + this.state.cam_effector + ".anm", cam_effector_id, false, "");
          level.add_pp_effector(this.state.pp_effector2 + ".ppe", pp_effector2_id, false);
          actor.health = -this.state.health_lost;
        }
      } else if (this.state.intensity > this.state.switch_lower_bound) {
        if (this.phase < 2) {
          globalSoundManager.playLoopedSound(actor.id(), this.state.heartbeet_sound);
          globalSoundManager.setLoopedSoundVolume(actor.id(), this.state.heartbeet_sound, heartbeet_intensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disable_bound) {
        if (this.phase < 1) {
          level.add_pp_effector(this.state.pp_effector + ".ppe", pp_effector_id, true);
          level.set_pp_effector_factor(pp_effector_id, pp_intensity);
          globalSoundManager.playLoopedSound(actor.id(), this.state.noise_sound);
          globalSoundManager.setLoopedSoundVolume(actor.id(), this.state.noise_sound, noise_intensity);
          this.phase = 1;
        }
      }
    } else {
      if (this.state.intensity < this.state.disable_bound) {
        if (this.phase > 0) {
          globalSoundManager.stopLoopedSound(actor.id(), this.state.noise_sound);
          level.remove_pp_effector(pp_effector_id);
          this.phase = 0;
        }
      } else if (this.state.intensity < this.state.switch_lower_bound) {
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actor.id(), this.state.heartbeet_sound);
          this.phase = 1;
        }
      } else if (this.state.intensity < this.state.switch_upper_bound) {
        level.remove_cam_effector(cam_effector_id);
        level.remove_pp_effector(pp_effector2_id);
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      if (this.phase > 0) {
        globalSoundManager.stopLoopedSound(actor.id(), this.state.noise_sound);
        level.remove_pp_effector(pp_effector_id);
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actor.id(), this.state.heartbeet_sound);
          level.remove_cam_effector(cam_effector_id);
          level.remove_pp_effector(pp_effector2_id);
        }
      }

      return;
    }
  }
}
