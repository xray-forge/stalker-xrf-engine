import { device, level, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ActorBinder } from "@/engine/core/objects/binders/creature/ActorBinder";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeDeimosState } from "@/engine/core/schemes/sr_deimos/ISchemeDeimosState";
import { clampNumber } from "@/engine/core/utils/number";
import { AnyObject, ClientObject, Optional, TIndex, TNumberId, TRate, TTimestamp, Vector } from "@/engine/lib/types";

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
  public constructor(object: ClientObject, state: ISchemeDeimosState) {
    super(object, state);

    this.state.intensity = 0;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const actor: Optional<ClientObject> = registry.actor;
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

    const vec: Vector = actor.get_movement_speed();
    const currentSpeed: TRate = math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    let intensityDelta: TRate = (this.state.movement_speed - currentSpeed) * 0.005;

    if (intensityDelta > 0) {
      intensityDelta = this.state.growing_koef * intensityDelta;
    } else {
      intensityDelta = this.state.lowering_koef * intensityDelta;
    }

    this.state.intensity = clampNumber(this.state.intensity + intensityDelta, 0, 1);

    const ppIntensity = this.state.intensity;
    const noiseIntensity = this.state.intensity;
    const heartbeetIntensity = this.state.intensity;

    if (this.phase > 0) {
      level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, ppIntensity);
      globalSoundManager.setLoopedSoundVolume(actorId, this.state.noise_sound, noiseIntensity);

      if (this.phase > 1) {
        globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeet_sound, heartbeetIntensity);
      }
    }

    if (intensityDelta > 0) {
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
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeet_sound, heartbeetIntensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disable_bound) {
        if (this.phase < 1) {
          level.add_pp_effector(this.state.pp_effector + ".ppe", DeimosManager.POST_PROCESS_EFFECTOR_ID, true);
          level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, ppIntensity);
          globalSoundManager.playLoopedSound(actorId, this.state.noise_sound);
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.noise_sound, noiseIntensity);
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
