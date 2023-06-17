import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeIdleState } from "@/engine/core/schemes/sr_idle/ISchemeIdleState";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/switch";
import { TCount } from "@/engine/lib/types";

/**
 * todo;
 */
export class IdleManager extends AbstractSchemeManager<ISchemeIdleState> {
  public override resetScheme(): void {
    this.state.signals = new LuaTable();
  }

  public override update(delta: TCount): void {
    // Nothing to do, just, try switching to anything else.
    trySwitchToAnotherSection(this.object, this.state);
  }
}
