import { color, hit, noise, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemePostProcessState } from "@/engine/core/schemes/sr_postprocess/ISchemePostProcessState";
import { PostProcessEffector } from "@/engine/core/schemes/sr_postprocess/PostProcessEffector";
import { abort } from "@/engine/core/utils/assertion";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { ClientObject, Color, Hit, Noise, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class SchemePostProcessManager extends AbstractSchemeManager<ISchemePostProcessState> {
  public isActorInside: boolean = false;
  public gray: number = 1;
  public grayAmplitude: number = 1.0;

  public postProcessEffector!: PostProcessEffector;
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
   * Handle reset event to play anew.
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

    this.postProcessEffector = new PostProcessEffector(this.object.id() + 2000);
    this.postProcessEffector.params.noise = new noise();
    this.postProcessEffector.start();

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
  public update(delta: TDuration): void {
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

    this.postProcessEffector.params.color_base = this.baseColor;
    this.postProcessEffector.params.color_gray = new color(
      this.grayColor.r + this.intensity,
      this.grayColor.g + this.intensity,
      this.grayColor.b + this.intensity
    );
    this.postProcessEffector.params.gray = this.grayAmplitude * this.intensity;
    this.postProcessEffector.params.noise = new noise(
      this.noiseVar.intensity * this.intensity,
      this.noiseVar.grain,
      this.noiseVar.fps
    );
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

    const now: TTimestamp = time_global();

    this.hitPower = this.hitPower + delta * 0.001 * this.state.hit_intensity;

    if (now - this.hitTime < 1000) {
      return;
    }

    this.hitTime = now;

    const actor: ClientObject = registry.actor;
    const actorHit: Hit = new hit();

    actorHit.power = this.hitPower;
    actorHit.direction = createEmptyVector();
    actorHit.impulse = 0;
    actorHit.draftsman = actor;

    // Hit with radiation.
    actorHit.type = hit.radiation;
    actor.hit(actorHit);

    // Hit with shock.
    actorHit.type = hit.shock;
    actor.hit(actorHit);
  }
}
