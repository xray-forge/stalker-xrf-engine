import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeLightState } from "@/engine/core/schemes/sr_light/ISchemeLightState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class LightManager extends AbstractSchemeManager<ISchemeLightState> {
  public active: boolean = false;

  /**
   * todo;
   */
  public override resetScheme(): void {
    logger.info("Reset scheme for:", this.object.name());
    registry.lightZones.set(this.object.id(), this);
  }

  /**
   * todo;
   */
  public override update(): void {
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
