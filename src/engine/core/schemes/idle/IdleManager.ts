import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemeIdleState } from "@/engine/core/schemes/idle/ISchemeIdleState";
import { TCount } from "@/engine/lib/types";

/**
 * todo;
 */
export class IdleManager extends AbstractSchemeManager<ISchemeIdleState> {
  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.state.signals = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public override update(delta: TCount): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }
}
