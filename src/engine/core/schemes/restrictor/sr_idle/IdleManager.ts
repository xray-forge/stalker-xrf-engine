import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { TCount } from "@/engine/lib/types";

/**
 * todo;
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
