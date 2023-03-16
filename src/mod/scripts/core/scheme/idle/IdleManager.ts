import { TCount } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/scheme/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/scheme/base/trySwitchToAnotherSection";
import { ISchemeIdleState } from "@/mod/scripts/core/scheme/idle/ISchemeIdleState";

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
