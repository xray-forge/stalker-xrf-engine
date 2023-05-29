import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeTimerState } from "@/engine/core/schemes/timer/ISchemeTimerState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { globalTimeToString } from "@/engine/core/utils/time";

/**
 * todo;
 */
export class SchemeTimerManager extends AbstractSchemeManager<ISchemeTimerState> {
  /**
   * todo: Description.
   */
  public override update(): void {
    const actor = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      return;
    }

    const nn = time_global() - registry.objects.get(this.object.id()).activation_time;

    let valueTime = this.state.type === "inc" ? this.state.start_value + nn : this.state.start_value - nn;

    if (valueTime <= 0) {
      valueTime = 0;
    }

    this.state.timer.TextControl().SetTextST(globalTimeToString(valueTime));

    for (const [k, v] of this.state.on_value!) {
      if ((this.state.type === "dec" && valueTime <= v.dist) || (this.state.type === "inc" && valueTime >= v.dist)) {
        switchObjectSchemeToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(registry.actor, this.object, v.state)!
        );
      }
    }
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    this.state.ui.RemoveCustomStatic(this.state.timer_id);

    if (this.state.string !== null) {
      this.state.ui.RemoveCustomStatic("hud_timer_text");
    }
  }
}
