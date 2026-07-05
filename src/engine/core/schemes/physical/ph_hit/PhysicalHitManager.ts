import { hit, patrol } from "xray16";
import { Hit, Vector } from "xray16/alias";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/physical/ph_hit/ph_hit_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { copyVector } from "@/engine/core/utils/vector";

/**
 * Manager handling physical hit scheme behaviour for an object.
 */
export class PhysicalHitManager extends AbstractSchemeManager<ISchemePhysicalHitState> {
  public override activate(): void {
    const patrolPoint: Vector = new patrol(this.state.dirPath).point(0);
    const objectPosition: Vector = this.object.position();

    const objectHit: Hit = new hit();

    objectHit.power = this.state.power;
    objectHit.impulse = this.state.impulse;
    objectHit.bone(this.state.bone);
    objectHit.type = hit.strike;
    objectHit.direction = copyVector(patrolPoint).sub(objectPosition); // todo: is copy needed?
    objectHit.draftsman = this.object;

    this.object.hit(objectHit);
  }

  public update(): void {
    trySwitchToAnotherSection(this.object, this.state);
  }

  /**
   * --[[
   * function action_hit:onHit(door, actor)
   *    if this.state.locked then
   *        if this.state.snd_open_start then
   *            this:door_play_snd_from_set(this.state.snd_open_start)
   *        end.
   *        Return
   *    end.
   *
   *    Const angle = this.joint:get_axis_angle(90).
   *
   *    If angle - this.low_limits > this.hi_limits - angle then
   *        this:open_door()
   *    else
   *        this:close_door(false)
   *    end
   * end
   * --]].
   */
}
