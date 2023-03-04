import { device, level, time_global, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { AnyObject, EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions, getConfigNumber } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { clampNumber } from "@/mod/scripts/utils/number";

const logger: LuaLogger = new LuaLogger("SchemeDeimos");

const pp_effector_id: number = 5;
const cam_effector_id: number = 6;
const pp_effector2_id: number = 7;

/**
 * todo;
 * Scheme only for 1 quest in the end of game? (pri_a28_sr_horror)
 */
export class SchemeDeimos extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_DEIMOS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribeActionForEvents(object, state, new SchemeDeimos(object, state));
  }

  public static override set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection
  ): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.movement_speed = getConfigNumber(ini, section, "movement_speed", object, false, 100);
    state.growing_koef = getConfigNumber(ini, section, "growing_koef", object, false, 0.1);
    state.lowering_koef = getConfigNumber(ini, section, "lowering_koef", object, false, state.growing_koef);
    state.pp_effector = getConfigNumber(ini, section, "pp_effector", object, false, "");
    state.cam_effector = getConfigNumber(ini, section, "cam_effector", object, false, "");
    state.pp_effector2 = getConfigNumber(ini, section, "pp_effector2", object, false, "");
    state.cam_effector_repeating_time =
      getConfigNumber(ini, section, "cam_effector_repeating_time", object, false, 10) * 1000;
    state.noise_sound = getConfigNumber(ini, section, "noise_sound", object, false, "");
    state.heartbeet_sound = getConfigNumber(ini, section, "heartbeet_sound", object, false, "");
    state.health_lost = getConfigNumber(ini, section, "health_lost", object, false, 0.01);
    state.disable_bound = getConfigNumber(ini, section, "disable_bound", object, false, 0.1);
    state.switch_lower_bound = getConfigNumber(ini, section, "switch_lower_bound", object, false, 0.5);
    state.switch_upper_bound = getConfigNumber(ini, section, "switch_upper_bound", object, false, 0.75);
  }

  public static check_intensity_delta(state: IStoredObject): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];
      const speedVector: XR_vector = registry.actor.get_movement_speed();
      const currentSpeed: number = math.sqrt(
        speedVector.x * speedVector.x + speedVector.y * speedVector.y + speedVector.z * speedVector.z
      );
      const intensity_delta: number = st.growing_koef * (st.movement_speed - currentSpeed) * 0.005;

      return intensity_delta < 0;
    }

    return false;
  }

  public static check_disable_bound(state: IStoredObject): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];

      return st.intensity < st.disable_bound;
    }

    return false;
  }

  public static check_lower_bound(state: IStoredObject): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];

      if (st.intensity < st.switch_lower_bound) {
        return true;
      }
    }

    return false;
  }

  public static check_upper_bound(state: IStoredObject): boolean {
    if (state.active_scheme === SchemeDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];

      return st.intensity < st.switch_upper_bound;
    }

    return false;
  }

  public cam_effector_time: number = 0;
  public phase: number = 0;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.state.intensity = 0;
  }

  public override update(delta: number): void {
    const actor: Optional<XR_game_object> = registry.actor;
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (!actor || device().precache_frame > 1) {
      return;
    }

    const actorId: number = actor.id();

    if ((actor as AnyObject).deimos_intensity) {
      this.state.intensity = (actor as AnyObject).deimos_intensity(actor as AnyObject).deimos_intensity = null;

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
