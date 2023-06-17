import { color, hit, noise, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemePostProcessState } from "@/engine/core/schemes/sr_postprocess/ISchemePostProcessState";
import { PPEffector } from "@/engine/core/schemes/sr_postprocess/PPEffector";
import { abort } from "@/engine/core/utils/assertion";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { ClientObject, Color, Hit, Noise, TDuration } from "@/engine/lib/types";

/**
 * todo;
 */
export class SchemePostProcessManager extends AbstractSchemeManager<ISchemePostProcessState> {
  public isActorInside: boolean = false;
  public gray: number = 1;
  public grayAmplitude: number = 1.0;

  public pp!: PPEffector;
  public noise!: Noise;
  public grayColor: Color = new color(0.5, 0.5, 0.5);
  public baseColor: Color = new color(0.5, 0.5, 0.5);
  public noiseVar: Noise = new noise(0.9, 0.5, 30);

  public effTime: number = 0;
  public hitTime: number = 0;
  public intensity: number = 0;
  public intensityBase: number = 0;
  public hitPower: number = 0;
  public intensityInertion: number = 0;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.isActorInside = false;

    this.grayAmplitude = 1.0;
    this.effTime = 0;
    this.hitTime = 0;
    this.intensity = 0;
    this.intensityBase = this.state.intensity;
    this.hitPower = 0;
    this.intensityInertion = this.intensityBase < 0.0 ? -this.state.intensity_speed : this.state.intensity_speed;

    this.pp = new PPEffector(this.object.id() + 2000);
    this.pp.params.noise = new noise();
    this.pp.start();

    this.gray = 1;
    this.noise = new noise(1.0, 0.3, 30);
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    abort("Called not expected method, not implemented originally");
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    const actor: ClientObject = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    this.isActorInside = this.object.inside(actor.position());

    const cTime: number = delta * 0.001;

    if (this.isActorInside === true) {
      this.intensity = this.intensity + this.intensityInertion * cTime;
      if (this.intensityBase < 0.0) {
        if (this.intensity < this.intensityBase) {
          this.intensity = this.intensityBase;
        }
      } else {
        if (this.intensity > this.intensityBase) {
          this.intensity = this.intensityBase;
        }
      }
    } else {
      if (this.intensityBase < 0.0) {
        this.intensity = this.intensity - this.intensityInertion * cTime;
        if (this.intensity > 0.0) {
          this.intensity = 0.0;
        }
      } else {
        this.intensity = this.intensity - this.intensityInertion * cTime;
        if (this.intensity < 0.0) {
          this.intensity = 0.0;
        }
      }
    }

    this.pp.params.color_base = this.baseColor;
    this.pp.params.color_gray = new color(
      this.grayColor.r + this.intensity,
      this.grayColor.g + this.intensity,
      this.grayColor.b + this.intensity
    );
    this.pp.params.gray = this.grayAmplitude * this.intensity;
    this.pp.params.noise = new noise(this.noiseVar.intensity * this.intensity, this.noiseVar.grain, this.noiseVar.fps);
    this.updateHit(delta);
  }

  /**
   * todo: Description.
   */
  public updateHit(delta: number): void {
    if (this.isActorInside === false) {
      this.hitPower = 0;

      return;
    }

    this.hitPower = this.hitPower + delta * 0.001 * this.state.hit_intensity;
    if (time_global() - this.hitTime < 1000) {
      return;
    }

    this.hitTime = time_global();

    const actor: ClientObject = registry.actor;
    const h: Hit = new hit();

    h.power = this.hitPower;
    h.direction = createEmptyVector();
    h.impulse = 0;
    h.draftsman = registry.actor;
    h.type = hit.radiation;
    registry.actor.hit(h);

    h.type = hit.shock;
    actor.hit(h);
  }
}
