import { device, level, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ActorBinder } from "@/engine/core/binders/creature/ActorBinder";
import { getManager, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
import { clampNumber } from "@/engine/core/utils/number";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { AnyObject, GameObject, Optional, TIndex, TNumberId, TRate, TTimestamp, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class DeimosManager extends AbstractSchemeManager<ISchemeDeimosState> {
  public static readonly POST_PROCESS_EFFECTOR_ID: TNumberId = 5;
  public static readonly POST_PROCESS_EFFECTOR_SECONDARY_ID: TNumberId = 7;
  public static readonly CAMERA_EFFECTOR_ID: TNumberId = 6;

  public cameraEffectorActivatedAt: TTimestamp = 0;
  public phase: TIndex = 0;

  public constructor(object: GameObject, state: ISchemeDeimosState) {
    super(object, state);

    this.state.intensity = 0;
  }

  public update(): void {
    const actor: Optional<GameObject> = registry.actor;
    const globalSoundManager: GlobalSoundManager = getManager(GlobalSoundManager);

    if (!actor || device().precache_frame > 1) {
      return;
    }

    const actorId: TNumberId = actor.id();

    if ((actor as unknown as ActorBinder).deimosIntensity) {
      this.state.intensity = (actor as AnyObject).deimosIntensity;
      (actor as unknown as ActorBinder).deimosIntensity = null;

      if (this.state.intensity > this.state.disableBound) {
        level.add_pp_effector(this.state.ppEffector + ".ppe", DeimosManager.POST_PROCESS_EFFECTOR_ID, true);
        globalSoundManager.playLoopedSound(actorId, this.state.noiseSound);
        this.phase = 1;
      }

      if (this.state.intensity > this.state.switchLowerBound) {
        globalSoundManager.playLoopedSound(actorId, this.state.heartbeetSound);
        this.phase = 2;
      }
    }

    const vec: Vector = actor.get_movement_speed();
    const currentSpeed: TRate = math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    let intensityDelta: TRate = (this.state.movementSpeed - currentSpeed) * 0.005;

    if (intensityDelta > 0) {
      intensityDelta = this.state.growingKoef * intensityDelta;
    } else {
      intensityDelta = this.state.loweringKoef * intensityDelta;
    }

    this.state.intensity = clampNumber(this.state.intensity + intensityDelta, 0, 1);

    const ppIntensity: TRate = this.state.intensity;
    const noiseIntensity: TRate = this.state.intensity;
    const heartbeetIntensity: TRate = this.state.intensity;

    if (this.phase > 0) {
      level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, ppIntensity);
      globalSoundManager.setLoopedSoundVolume(actorId, this.state.noiseSound, noiseIntensity);

      if (this.phase > 1) {
        globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeetSound, heartbeetIntensity);
      }
    }

    if (intensityDelta > 0) {
      if (this.state.intensity > this.state.switchUpperBound) {
        const now: TTimestamp = time_global();

        if (now - this.cameraEffectorActivatedAt > this.state.camEffectorRepeatingTime) {
          this.cameraEffectorActivatedAt = now;
          level.add_cam_effector(
            "camera_effects\\" + this.state.camEffector + ".anm",
            DeimosManager.CAMERA_EFFECTOR_ID,
            false,
            ""
          );
          level.add_pp_effector(
            this.state.ppEffector2 + ".ppe",
            DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID,
            false
          );
          actor.health = -this.state.healthLost;
        }
      } else if (this.state.intensity > this.state.switchLowerBound) {
        if (this.phase < 2) {
          globalSoundManager.playLoopedSound(actorId, this.state.heartbeetSound);
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.heartbeetSound, heartbeetIntensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disableBound) {
        if (this.phase < 1) {
          level.add_pp_effector(this.state.ppEffector + ".ppe", DeimosManager.POST_PROCESS_EFFECTOR_ID, true);
          level.set_pp_effector_factor(DeimosManager.POST_PROCESS_EFFECTOR_ID, ppIntensity);
          globalSoundManager.playLoopedSound(actorId, this.state.noiseSound);
          globalSoundManager.setLoopedSoundVolume(actorId, this.state.noiseSound, noiseIntensity);
          this.phase = 1;
        }
      }
    } else {
      if (this.state.intensity < this.state.disableBound) {
        if (this.phase > 0) {
          globalSoundManager.stopLoopedSound(actorId, this.state.noiseSound);
          level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_ID);
          this.phase = 0;
        }
      } else if (this.state.intensity < this.state.switchLowerBound) {
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actorId, this.state.heartbeetSound);
          this.phase = 1;
        }
      } else if (this.state.intensity < this.state.switchUpperBound) {
        level.remove_cam_effector(DeimosManager.CAMERA_EFFECTOR_ID);
        level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID);
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state)) {
      if (this.phase > 0) {
        globalSoundManager.stopLoopedSound(actorId, this.state.noiseSound);
        level.remove_pp_effector(DeimosManager.POST_PROCESS_EFFECTOR_ID);
        if (this.phase > 1) {
          globalSoundManager.stopLoopedSound(actorId, this.state.heartbeetSound);
          level.remove_cam_effector(DeimosManager.POST_PROCESS_EFFECTOR_SECONDARY_ID);
          level.remove_pp_effector(DeimosManager.CAMERA_EFFECTOR_ID);
        }
      }

      return;
    }
  }
}
