import { device, level, time_global, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { getConfigNumber } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { clampNumber } from "@/mod/scripts/utils/number";
import { on_off_cmds } from "@/mod/ui/menu/debug/sections";

const logger: LuaLogger = new LuaLogger("ActionDeimos");

const pp_effector_id = 5;
const cam_effector_id = 6;
const pp_effector2_id = 7;

/**
 * Scheme only for 1 quest in the end of game? (pri_a28_sr_horror)
 */
export class ActionDeimos extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_deimos";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      on_off_cmds,
      state,
      new ActionDeimos(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

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
    if (state.active_scheme === ActionDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];
      const speedVector: XR_vector = getActor()!.get_movement_speed();
      const currentSpeed: number = math.sqrt(
        speedVector.x * speedVector.x + speedVector.y * speedVector.y + speedVector.z * speedVector.z
      );
      const intensity_delta: number = st.growing_koef * (st.movement_speed - currentSpeed) * 0.005;

      return intensity_delta < 0;
    }

    return false;
  }

  public static check_disable_bound(state: IStoredObject): boolean {
    if (state.active_scheme === ActionDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];

      return st.intensity < st.disable_bound;
    }

    return false;
  }

  public static check_lower_bound(state: IStoredObject): boolean {
    if (state.active_scheme === ActionDeimos.SCHEME_SECTION) {
      const st = state[state.active_scheme];

      if (st.intensity < st.switch_lower_bound) {
        return true;
      }
    }

    return false;
  }

  public static check_upper_bound(state: IStoredObject): boolean {
    if (state.active_scheme === ActionDeimos.SCHEME_SECTION) {
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

  public update(delta: number): void {
    const actor: Optional<XR_game_object> = getActor();

    if (!actor || device().precache_frame > 1) {
      return;
    }

    const actorId: number = actor.id();

    logger.info("A");

    if ((actor as AnyObject).deimos_intensity) {
      this.state.intensity = (actor as AnyObject).deimos_intensity(actor as AnyObject).deimos_intensity = null;

      if (this.state.intensity > this.state.disable_bound) {
        level.add_pp_effector(this.state.pp_effector + ".ppe", pp_effector_id, true);
        GlobalSound.play_sound_looped(actorId, this.state.noise_sound);
        this.phase = 1;
      }

      if (this.state.intensity > this.state.switch_lower_bound) {
        GlobalSound.play_sound_looped(actorId, this.state.heartbeet_sound);
        this.phase = 2;
      }
    }

    logger.info("B");

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
      GlobalSound.set_volume_sound_looped(actorId, this.state.noise_sound, noise_intensity);

      if (this.phase > 1) {
        GlobalSound.set_volume_sound_looped(actorId, this.state.heartbeet_sound, heartbeet_intensity);
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
          GlobalSound.play_sound_looped(actor.id(), this.state.heartbeet_sound);
          GlobalSound.set_volume_sound_looped(actor.id(), this.state.heartbeet_sound, heartbeet_intensity);
          this.phase = 2;
        }
      } else if (this.state.intensity > this.state.disable_bound) {
        if (this.phase < 1) {
          level.add_pp_effector(this.state.pp_effector + ".ppe", pp_effector_id, true);
          level.set_pp_effector_factor(pp_effector_id, pp_intensity);
          GlobalSound.play_sound_looped(actor.id(), this.state.noise_sound);
          GlobalSound.set_volume_sound_looped(actor.id(), this.state.noise_sound, noise_intensity);
          this.phase = 1;
        }
      }
    } else {
      if (this.state.intensity < this.state.disable_bound) {
        if (this.phase > 0) {
          GlobalSound.stop_sound_looped(actor.id(), this.state.noise_sound);
          level.remove_pp_effector(pp_effector_id);
          this.phase = 0;
        }
      } else if (this.state.intensity < this.state.switch_lower_bound) {
        if (this.phase > 1) {
          GlobalSound.stop_sound_looped(actor.id(), this.state.heartbeet_sound);
          this.phase = 1;
        }
      } else if (this.state.intensity < this.state.switch_upper_bound) {
        level.remove_cam_effector(cam_effector_id);
        level.remove_pp_effector(pp_effector2_id);
      }
    }

    logger.info("C");

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, actor)) {
      if (this.phase > 0) {
        GlobalSound.stop_sound_looped(actor.id(), this.state.noise_sound);
        level.remove_pp_effector(pp_effector_id);
        if (this.phase > 1) {
          GlobalSound.stop_sound_looped(actor.id(), this.state.heartbeet_sound);
          level.remove_cam_effector(cam_effector_id);
          level.remove_pp_effector(pp_effector2_id);
        }
      }

      return;
    }
  }
}
