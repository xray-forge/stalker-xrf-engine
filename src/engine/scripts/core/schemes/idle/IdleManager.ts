import { TCount } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeIdleState } from "@/engine/scripts/core/schemes/idle/ISchemeIdleState";

/**
 * todo;
 */
export class IdleManager extends AbstractSchemeManager<ISchemeIdleState> {
  /**
   * todo;
   */
  public override resetScheme(): void {
    this.state.signals = new LuaTable();
  }

  /**
   * todo;
   */
  public override update(delta: TCount): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }
}
