import { get_hud, level, XR_game_object, XR_ini_file } from "xray16";

import { post_processors } from "@/mod/globals/animation/post_processors";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { pstor_retrieve, pstor_store } from "@/mod/scripts/core/db/pstor";
import {
  assign_storage_and_bind,
  subscribe_action_for_events,
  try_switch_to_another_section,
} from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionPostProcess } from "@/mod/scripts/core/logic/ActionPostProcess";
import { PsyAntennaManager } from "@/mod/scripts/core/managers/PsyAntennaManager";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionPsyAntenna");

const state_outside = 0;
const state_inside = 1;
const state_void = 2;

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
    subscribe_action_for_events(object, state, new ActionPostProcess(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = assign_storage_and_bind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.intensity = getConfigNumber(ini, section, "eff_intensity", object, true) * 0.01;
    st.postprocess = getConfigString(ini, section, "postprocess", object, false, "", post_processors.psy_antenna);
    st.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true) * 0.01;
    st.phantom_prob = getConfigNumber(ini, section, "phantom_prob", object, false, 0) * 0.01;
    st.mute_sound_threshold = getConfigNumber(ini, section, "mute_sound_threshold", object, false, 0);
    st.no_static = getConfigBoolean(ini, section, "no_static", object, false, false);
    st.no_mumble = getConfigBoolean(ini, section, "no_mumble", object, false, false);
    st.hit_type = getConfigString(ini, section, "hit_type", object, false, "", "wound");
    st.hit_freq = getConfigNumber(ini, section, "hit_freq", object, false, 5000);
  }

  public antennaState = state_void;
  public antennaManager = PsyAntennaManager.getInstance();

  public reset_scheme(loading?: boolean): void {
    if (loading) {
      this.antennaState = pstor_retrieve(this.object, "inside")!;
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

    if (try_switch_to_another_section(this.object, this.state, actor)) {
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

    this.antennaManager.sound_intensity_base = this.antennaManager.sound_intensity_base + this.state.intensity;
    this.antennaManager.mute_sound_threshold =
      this.antennaManager.mute_sound_threshold + this.state.mute_sound_threshold;
    this.antennaManager.hit_intensity = this.antennaManager.hit_intensity + this.state.hit_intensity;
    this.antennaManager.phantom_spawn_probability =
      this.antennaManager.phantom_spawn_probability + this.state.phantom_prob;

    this.antennaManager.no_static = this.state.no_static;
    this.antennaManager.no_mumble = this.state.no_mumble;
    this.antennaManager.hit_type = this.state.hit_type;
    this.antennaManager.hit_freq = this.state.hit_freq;

    if (this.state.postprocess === "nil") {
      return;
    }

    if (!this.antennaManager.postprocess.has(this.state.postprocess)) {
      this.antennaManager.postprocess_count = this.antennaManager.postprocess_count + 1;
      this.antennaManager.postprocess.set(this.state.postprocess, {
        intensity_base: 0,
        intensity: 0,
        idx: 1500 + this.antennaManager.postprocess_count,
      });

      level.add_pp_effector(
        this.state.postprocess,
        this.antennaManager.postprocess.get(this.state.postprocess).idx,
        true
      );
      level.set_pp_effector_factor(this.antennaManager.postprocess.get(this.state.postprocess).idx, 0.01);
    }

    this.antennaManager.postprocess.get(this.state.postprocess).intensity_base =
      this.antennaManager.postprocess.get(this.state.postprocess).intensity_base + this.state.intensity;
  }

  public zone_leave(): void {
    this.antennaState = state_outside;

    get_hud().enable_fake_indicators(false);

    this.antennaManager.sound_intensity_base = this.antennaManager.sound_intensity_base - this.state.intensity;
    this.antennaManager.mute_sound_threshold =
      this.antennaManager.mute_sound_threshold - this.state.mute_sound_threshold;
    this.antennaManager.hit_intensity = this.antennaManager.hit_intensity - this.state.hit_intensity;

    this.antennaManager.phantom_spawn_probability =
      this.antennaManager.phantom_spawn_probability - this.state.phantom_prob;

    if (this.state.postprocess === "nil") {
      return;
    }

    if (this.antennaManager.postprocess.has(this.state.postprocess)) {
      this.antennaManager.postprocess.get(this.state.postprocess).intensity_base =
        this.antennaManager.postprocess.get(this.state.postprocess).intensity_base - this.state.intensity;
    }
  }

  public save(): void {
    pstor_store(this.object, "inside", this.antennaState);
  }
}
