import { color, hit, noise, time_global, vector, XR_game_object, XR_ini_file, XR_noise } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { IPPEffector, PPEffector } from "@/mod/scripts/core/schemes/sr_postprocess/PPEffector";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions, getConfigNumber } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePostProcess");

/**
 * todo;
 */
export class SchemePostProcess extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.SR_POSTPROCESS;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribeActionForEvents(object, state, new SchemePostProcess(object, state));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    additional: string
  ): void;
  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.intensity = getConfigNumber(ini, section, "intensity", object, true) * 0.01;
    state.intensity_speed = getConfigNumber(ini, section, "intensity_speed", object, true) * 0.01;
    state.hit_intensity = getConfigNumber(ini, section, "hit_intensity", object, true);
  }

  public actor_inside: boolean = false;
  public gray: number = 1;
  public gray_amplitude: number = 1.0;

  public pp!: IPPEffector;
  public noise!: XR_noise;
  public gray_color = new color(0.5, 0.5, 0.5);
  public base_color = new color(0.5, 0.5, 0.5);
  public noise_var = new noise(0.9, 0.5, 30);

  public eff_time: number = 0;
  public hit_time: number = 0;
  public intensity: number = 0;
  public intensity_base: number = 0;
  public hit_power: number = 0;
  public intensity_inertion: number = 0;

  public reset_scheme(): void {
    this.actor_inside = false;

    this.gray_amplitude = 1.0;
    this.eff_time = 0;
    this.hit_time = 0;
    this.intensity = 0;
    this.intensity_base = this.state.intensity;
    this.hit_power = 0;
    this.intensity_inertion = this.intensity_base < 0.0 ? -this.state.intensity_speed : this.state.intensity_speed;

    this.pp = create_xr_class_instance(PPEffector, this.object.id() + 2000);
    this.pp.params.noise = new noise();
    this.pp.start();

    this.gray = 1;
    this.noise = new noise(1.0, 0.3, 30);
  }

  public deactivate(): void {
    abort("Called not expected method, not implemented originally");
  }

  public update(delta: number): void {
    const actor = getActor()!;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      return;
    }

    this.actor_inside = this.object.inside(actor.position());

    const c_time: number = delta * 0.001;

    if (this.actor_inside === true) {
      this.intensity = this.intensity + this.intensity_inertion * c_time;
      if (this.intensity_base < 0.0) {
        if (this.intensity < this.intensity_base) {
          this.intensity = this.intensity_base;
        }
      } else {
        if (this.intensity > this.intensity_base) {
          this.intensity = this.intensity_base;
        }
      }
    } else {
      if (this.intensity_base < 0.0) {
        this.intensity = this.intensity - this.intensity_inertion * c_time;
        if (this.intensity > 0.0) {
          this.intensity = 0.0;
        }
      } else {
        this.intensity = this.intensity - this.intensity_inertion * c_time;
        if (this.intensity < 0.0) {
          this.intensity = 0.0;
        }
      }
    }

    this.pp.params.color_base = this.base_color;
    this.pp.params.color_gray = new color(
      this.gray_color.r + this.intensity,
      this.gray_color.g + this.intensity,
      this.gray_color.b + this.intensity
    );
    this.pp.params.gray = this.gray_amplitude * this.intensity;
    this.pp.params.noise = new noise(
      this.noise_var.intensity * this.intensity,
      this.noise_var.grain,
      this.noise_var.fps
    );
    this.update_hit(delta);
  }

  public update_hit(delta: number): void {
    if (this.actor_inside === false) {
      this.hit_power = 0;

      return;
    }

    this.hit_power = this.hit_power + delta * 0.001 * this.state.hit_intensity;
    if (time_global() - this.hit_time < 1000) {
      return;
    }

    this.hit_time = time_global();

    const actor = getActor()!;
    const h = new hit();

    h.power = this.hit_power;
    h.direction = new vector().set(0, 0, 0);
    h.impulse = 0;
    h.draftsman = getActor();
    h.type = hit.radiation;
    getActor()!.hit(h);

    h.type = hit.shock;
    actor.hit(h);
  }
}
