import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeLightState } from "@/engine/core/schemes/restrictor/sr_light/sr_light_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { GameObject } from "@/engine/lib/types";

/**
 * todo;
 * todo: Also unregister on deactivate?
 */
export class LightManager extends AbstractSchemeManager<ISchemeLightState> {
  public active: boolean = false;

  public override activate(): void {
    registry.lightZones.set(this.object.id(), this);
  }

  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      this.active = false;
      registry.lightZones.delete(this.object.id());
    } else {
      this.active = true;
    }
  }

  /**
   * todo: Description.
   */
  public checkStalker(object: GameObject): LuaMultiReturn<[boolean, boolean]> {
    if (!this.active) {
      return $multi(false, false);
    }

    if (this.object.inside(object.position())) {
      return $multi(this.state.light, true);
    }

    return $multi(false, false);
  }
}
