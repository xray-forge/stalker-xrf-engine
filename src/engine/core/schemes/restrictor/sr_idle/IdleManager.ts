import { TCount } from "xray16/lib";

import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";

/**
 * Manager handling idle scheme behaviour for an object, only switching to another section when conditions allow.
 */
export class IdleManager extends AbstractSchemeManager<ISchemeIdleState> {
  public override activate(): void {
    this.state.signals = new LuaTable();
  }

  public update(delta: TCount): void {
    // Nothing to do, just, try switching to anything else.
    trySwitchToAnotherSection(this.object, this.state);
  }
}
