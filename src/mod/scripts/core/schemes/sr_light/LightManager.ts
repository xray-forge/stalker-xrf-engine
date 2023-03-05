import { XR_game_object } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeLightState } from "@/mod/scripts/core/schemes/sr_light/ISchemeLightState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("LightManager");

/**
 * todo;
 */
export class LightManager extends AbstractSchemeManager<ISchemeLightState> {
  public active: boolean = false;

  public override resetScheme(): void {
    logger.info("Reset scheme:", this.object.id());
    registry.lightZones.set(this.object.id(), this);
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      this.active = false;

      registry.lightZones.delete(this.object.id());

      return;
    }

    this.active = true;
  }

  /**
   * todo;
   */
  public check_stalker(object: XR_game_object): LuaMultiReturn<[boolean, boolean]> {
    if (!this.active) {
      return $multi(false, false);
    }

    if (this.object.inside(object.position())) {
      return $multi(this.state.light!, true);
    }

    return $multi(false, false);
  }
}
