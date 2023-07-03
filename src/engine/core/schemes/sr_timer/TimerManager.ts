import { CUIGameCustom, get_hud, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/sr_timer/ISchemeTimerState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { globalTimeToString } from "@/engine/core/utils/time";
import { Optional, TSection, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Timer manager to increment/decrement time according to scheme logic and show UI timer.
 */
export class TimerManager extends AbstractSchemeManager<ISchemeTimerState> {
  public override resetScheme(): void {
    logger.info("Reset timer:", this.object.name());

    const hud: CUIGameCustom = get_hud();

    hud.AddCustomStatic(this.state.timerId, true);

    this.state.timer = hud.GetCustomStatic(this.state.timerId)!.wnd();

    if (this.state.string) {
      hud.AddCustomStatic("hud_timer_text", true);
      hud.GetCustomStatic("hud_timer_text")!.wnd().TextControl().SetTextST(this.state.string);
    }
  }

  public override deactivate(): void {
    logger.info("Deactivate timer:", this.object.name());

    const hud: CUIGameCustom = get_hud();

    hud.RemoveCustomStatic(this.state.timerId);

    if (this.state.string !== null) {
      hud.RemoveCustomStatic("hud_timer_text");
    }
  }

  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }

    const sinceActivation: TTimestamp = time_global() - registry.objects.get(this.object.id()).activationTime;

    let valueTime: TTimestamp =
      this.state.type === ETimerType.INCREMENT
        ? this.state.startValue + sinceActivation
        : this.state.startValue - sinceActivation;

    if (valueTime <= 0) {
      valueTime = 0;
    }

    this.state.timer.TextControl().SetTextST(globalTimeToString(valueTime));

    if (this.state.onValue) {
      const expectedValue: TTimestamp = tonumber(this.state.onValue.v1) as TTimestamp;

      if (
        (this.state.type === ETimerType.DECREMENT && valueTime <= expectedValue) ||
        (this.state.type === ETimerType.INCREMENT && valueTime >= expectedValue)
      ) {
        const nextSection: Optional<TSection> = pickSectionFromCondList(
          registry.actor,
          this.object,
          this.state.onValue.condlist
        );

        logger.info("Switch to another section:", this.object.name(), nextSection);
        switchObjectSchemeToSection(this.object, this.state.ini!, nextSection);
      }
    }
  }
}
