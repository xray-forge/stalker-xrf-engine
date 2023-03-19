import { hit, patrol, vector, XR_hit, XR_vector } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/ph_hit/ISchemePhysicalHitState";

/**
 * todo;
 */
export class PhysicalHitManager extends AbstractSchemeManager<ISchemePhysicalHitState> {
  /**
   * todo;
   */
  public override resetScheme(): void {
    const p1: XR_vector = new patrol(this.state.dir_path).point(0);
    const p2: XR_vector = this.object.position();

    const hitObject: XR_hit = new hit();

    hitObject.power = this.state.power;
    hitObject.impulse = this.state.impulse;
    hitObject.bone(this.state.bone);
    hitObject.type = hit.strike;
    hitObject.direction = new vector().set(p1).sub(p2);
    hitObject.draftsman = this.object;
    this.object.hit(hitObject);
  }

  /**
   * todo;
   */
  public override update(): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  /**
   * --[[
   * function action_hit:hit_callback(door, actor)
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
