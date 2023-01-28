import { get_hud, level, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionPostProcess } from "@/mod/scripts/core/logic/ActionPostProcess";
import { PsyAntenna } from "@/mod/scripts/core/logic/psy/PsyAntenna";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionPsyAntenna");

const state_outside = 0;
const state_inside = 1;
const state_void = 2;

let psy_antenna!: PsyAntenna;

export class ActionPsyAntenna extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_psy_antenna";

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    if (!psy_antenna) {
      psy_antenna = new PsyAntenna();
    }

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionPostProcess(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

    st.intensity = getConfigNumber(ini, section, "eff_intensity", object, true) * 0.01;
    st.postprocess = getConfigString(ini, section, "postprocess", object, false, "", "psy_antenna.ppe");

    st.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true) * 0.01;
    st.phantom_prob = getConfigNumber(ini, section, "phantom_prob", object, false, 0) * 0.01;

    st.mute_sound_threshold = getConfigNumber(ini, section, "mute_sound_threshold", object, false, 0);

    st.no_static = getConfigBoolean(ini, section, "no_static", object, false, false);
    st.no_mumble = getConfigBoolean(ini, section, "no_mumble", object, false, false);
    st.hit_type = getConfigString(ini, section, "hit_type", object, false, "", "wound");
    st.hit_freq = getConfigNumber(ini, section, "hit_freq", object, false, 5000);
  }

  public antennaState = state_void;

  public reset_scheme(loading?: boolean): void {
    if (loading) {
      this.antennaState = get_global<AnyCallablesModule>("xr_logic").pstor_retrieve(this.object, "inside");
    }

    if (this.antennaState === state_inside) {
      this.zone_leave();
    }

    this.antennaState = state_void;

    this.switch_state(getActor()!);
  }

  public deactivate(): void {
    if (this.antennaState === state_inside) {
      this.zone_leave();
    }
  }

  public update(delta: number): void {
    const actor = getActor()!;

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, actor)) {
      return;
    }

    this.switch_state(actor);
  }

  public switch_state(actor: XR_game_object): void {
    if (this.antennaState !== state_inside) {
      if (this.object.inside(actor.position())) {
        this.zone_enter();

        return;
      }
    } else {
      if (!this.object.inside(actor.position())) {
        this.zone_leave();

        return;
      }
    }
  }

  public zone_enter(): void {
    this.antennaState = state_inside;

    get_hud().enable_fake_indicators(true);

    psy_antenna.sound_intensity_base = psy_antenna.sound_intensity_base + this.state.intensity;
    psy_antenna.mute_sound_threshold = psy_antenna.mute_sound_threshold + this.state.mute_sound_threshold;
    psy_antenna.hit_intensity = psy_antenna.hit_intensity + this.state.hit_intensity;
    psy_antenna.phantom_spawn_probability = psy_antenna.phantom_spawn_probability + this.state.phantom_prob;

    psy_antenna.no_static = this.state.no_static;
    psy_antenna.no_mumble = this.state.no_mumble;
    psy_antenna.hit_type = this.state.hit_type;
    psy_antenna.hit_freq = this.state.hit_freq;

    if (this.state.postprocess === "nil") {
      return;
    }

    if (!psy_antenna.postprocess.has(this.state.postprocess)) {
      psy_antenna.postprocess_count = psy_antenna.postprocess_count + 1;
      psy_antenna.postprocess.set(this.state.postprocess, {
        intensity_base: 0,
        intensity: 0,
        idx: 1500 + psy_antenna.postprocess_count
      });

      level.add_pp_effector(this.state.postprocess, psy_antenna.postprocess.get(this.state.postprocess).idx, true);
      level.set_pp_effector_factor(psy_antenna.postprocess.get(this.state.postprocess).idx, 0.01);
    }

    psy_antenna.postprocess.get(this.state.postprocess).intensity_base =
      psy_antenna.postprocess.get(this.state.postprocess).intensity_base + this.state.intensity;
  }

  public zone_leave(): void {
    this.antennaState = state_outside;

    get_hud().enable_fake_indicators(false);

    psy_antenna.sound_intensity_base = psy_antenna.sound_intensity_base - this.state.intensity;
    psy_antenna.mute_sound_threshold = psy_antenna.mute_sound_threshold - this.state.mute_sound_threshold;
    psy_antenna.hit_intensity = psy_antenna.hit_intensity - this.state.hit_intensity;

    psy_antenna.phantom_spawn_probability = psy_antenna.phantom_spawn_probability - this.state.phantom_prob;

    if (this.state.postprocess === "nil") {
      return;
    }

    if (psy_antenna.postprocess.has(this.state.postprocess)) {
      psy_antenna.postprocess.get(this.state.postprocess).intensity_base =
        psy_antenna.postprocess.get(this.state.postprocess).intensity_base - this.state.intensity;
    }
  }

  public save(): void {
    get_global<AnyCallablesModule>("xr_logic").pstor_store(this.object, "inside", this.antennaState);
  }
}

/**
 * function save(p) {
 *   set_save_marker(p, "save", false, "sr_psy_antenna")
 *   if psy_antenna and !utils.level_changing(){
 *     p:w_bool(true)
 *
 *     psy_antenna:save(p)
 *   else
 *     p:w_bool(false)
 *   }
 *   set_save_marker(p, "save", true, "sr_psy_antenna")
 * }
 *
 * function load(p) {
 *   set_save_marker(p, "load", false, "sr_psy_antenna")
 *   const b = p:r_bool()
 *
 *   if b{
 *     if (psy_antenna) {
 *       abort("sr_psy_antenna.psy_antenna already exists!")
 *     }
 *
 *     psy_antenna = PsyAntenna()
 *     psy_antenna:construct()
 *
 *     psy_antenna:load(p)
 *   }
 *   set_save_marker(p, "load", true, "sr_psy_antenna")
 * }
 */
