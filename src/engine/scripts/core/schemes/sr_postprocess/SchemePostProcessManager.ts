import { color, hit, noise, time_global, vector, XR_game_object, XR_hit, XR_noise } from "xray16";

import { TDuration } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePostProcessState } from "@/engine/scripts/core/schemes/sr_postprocess/ISchemePostProcessState";
import { PPEffector } from "@/engine/scripts/core/schemes/sr_postprocess/PPEffector";
import { abort } from "@/engine/scripts/utils/debug";

/**
 * todo;
 */
export class SchemePostProcessManager extends AbstractSchemeManager<ISchemePostProcessState> {
  public actor_inside: boolean = false;
  public gray: number = 1;
  public gray_amplitude: number = 1.0;

  public pp!: PPEffector;
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

  /**
   * todo;
   */
  public override resetScheme(): void {
    this.actor_inside = false;

    this.gray_amplitude = 1.0;
    this.eff_time = 0;
    this.hit_time = 0;
    this.intensity = 0;
    this.intensity_base = this.state.intensity;
    this.hit_power = 0;
    this.intensity_inertion = this.intensity_base < 0.0 ? -this.state.intensity_speed : this.state.intensity_speed;

    this.pp = new PPEffector(this.object.id() + 2000);
    this.pp.params.noise = new noise();
    this.pp.start();

    this.gray = 1;
    this.noise = new noise(1.0, 0.3, 30);
  }

  /**
   * todo;
   */
  public override deactivate(): void {
    abort("Called not expected method, not implemented originally");
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    const actor = registry.actor;

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

  /**
   * todo;
   */
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

    const actor: XR_game_object = registry.actor;
    const h: XR_hit = new hit();

    h.power = this.hit_power;
    h.direction = new vector().set(0, 0, 0);
    h.impulse = 0;
    h.draftsman = registry.actor;
    h.type = hit.radiation;
    registry.actor.hit(h);

    h.type = hit.shock;
    actor.hit(h);
  }
}
