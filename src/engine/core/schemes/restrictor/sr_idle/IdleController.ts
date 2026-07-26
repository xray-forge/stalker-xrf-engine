import { TCount } from "xray16/lib";

import { AbstractSchemeController } from "@/engine/core/schemes/base";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";

/**
 * Controller handling idle scheme behaviour for an object, only switching to another section when conditions allow.
 */
export class IdleController extends AbstractSchemeController<ISchemeIdleState> {
  public override activate(): void {
    this.state.signals = new LuaTable();
  }

  public update(delta: TCount): void {
    // Nothing to do, just, try switching to anything else.
    trySwitchToAnotherSection(this.object, this.state);
  }
}
