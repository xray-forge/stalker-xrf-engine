import { hit, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/ph_hit/ISchemePhysicalHitState";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { copyVector } from "@/engine/core/utils/vector";
import { Hit, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhysicalHitManager extends AbstractSchemeManager<ISchemePhysicalHitState> {
  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    const p1: Vector = new patrol(this.state.dir_path).point(0);
    const p2: Vector = this.object.position();

    const hitObject: Hit = new hit();

    hitObject.power = this.state.power;
    hitObject.impulse = this.state.impulse;
    hitObject.bone(this.state.bone);
    hitObject.type = hit.strike;
    hitObject.direction = copyVector(p1).sub(p2); // subVectors util?
    hitObject.draftsman = this.object;
    this.object.hit(hitObject);
  }

  /**
   * todo: Description.
   */
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
