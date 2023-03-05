import { TCount } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeIdleState } from "@/mod/scripts/core/schemes/idle/ISchemeIdleState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";

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
