import { hit, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/physical/ph_hit/ph_hit_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { copyVector } from "@/engine/core/utils/vector";
import { Hit, Vector } from "@/engine/lib/types";

/**
 * todo;
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
   *        end
   *        return
   *    end
   *
   *    const angle = this.joint:get_axis_angle(90)
   *
   *    if angle - this.low_limits > this.hi_limits - angle then
   *        this:open_door()
   *    else
   *        this:close_door(false)
   *    end
   * end
   * --]]
   */
}
